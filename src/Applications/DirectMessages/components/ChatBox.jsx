import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeftLong, faArrowRightLong, faPlus, faTrash, faCrown } from '@fortawesome/free-solid-svg-icons'
import { io } from 'socket.io-client'
import { MobileNavigation } from './MobileNavigation'
import { authFetch } from '../../../AuthContext'
import VoiceCallUI from './Call/VoiceCallUI'

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024 // 50MB

const ChatBox = ({ selected, setSelected, selectedServer, setServer, access, user }) => {
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [prevImage, setPrevImage] = useState(null)
  const [message, setMessage] = useState('')
  const [socket, setSocket] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const chatAreaRef = useRef(null)
  const prevImageUrlRef = useRef(null)

  useEffect(() => {
    if (selectedServer && selectedServer.channels && selected.channelID) {
      setSelectedChannel(selectedServer.channels.find(ch => ch._id === selected.channelID) || null)
    } else {
      setSelectedChannel(null)
    }
  }, [selectedServer, selected.channelID])

  useEffect(() => {
    const sock = io(process.env.REACT_APP_SERVER)
    setSocket(sock)

    sock.on('getMessage', (data) => {
      if (data.server._id === selectedServer._id) {
        setServer(data.server)
      }
    })

    sock.on('updateServer', (data) => {
      if (data.server._id === selectedServer._id) {
        setServer(data.server)
      }
    })

    return () => sock.disconnect()
  }, [selectedServer._id])

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight
    }
  }, [selectedChannel])

  useEffect(() => {
    return () => {
      if (prevImageUrlRef.current) URL.revokeObjectURL(prevImageUrlRef.current)
    }
  }, [])

  const clearAttachment = () => {
    if (prevImageUrlRef.current) URL.revokeObjectURL(prevImageUrlRef.current)
    prevImageUrlRef.current = null
    setSelectedFile(null)
    setPrevImage(null)
    setUploadError('')
  }

  const formatTimestamp = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const sendMessage = async (event) => {
    event.preventDefault()
    const serverUser = selectedServer.serverUsers.find(u => u.userId === user.userId)
    if (!socket) return

    if (selectedFile) {
      setUploading(true)
      setUploadError('')
      try {
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('serverId', selected.serverID)
        formData.append('channelId', selected.channelID)
        formData.append('user', JSON.stringify(serverUser))
        formData.append('timestamp', new Date().toISOString())
        if (message) formData.append('caption', message)

        const res = await authFetch('/api/chat/upload-media', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          console.error('upload-media failed:', await res.text())
          setUploadError('Upload failed. Please try again.')
          return
        }
      } catch (err) {
        console.error('upload-media error:', err)
        setUploadError('Upload failed. Please try again.')
        return
      } finally {
        setUploading(false)
        setMessage('')
        clearAttachment()
      }
      return
    }

    if (message !== '') {
      socket.emit('sendMessage', {
        serverID: selected.serverID,
        channelID: selected.channelID,
        messageType: 'Message',
        message,
        user: serverUser,
        file: null,
        timestamp: new Date().toISOString(),
      })
      setMessage('')
    }
  }

  const removeMessage = (msg) => {
    socket.emit('removeMessage', {
      message: msg,
      channelID: selectedChannel._id,
      deletedBy: user,
    })
  }

  const fileSelectHandler = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError('That file is over the 50MB limit.')
      e.target.value = ''
      return
    }

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setUploadError('Only images and videos can be uploaded.')
      e.target.value = ''
      return
    }

    if (prevImageUrlRef.current) URL.revokeObjectURL(prevImageUrlRef.current)
    const objectUrl = URL.createObjectURL(file)
    prevImageUrlRef.current = objectUrl
    setSelectedFile(file)
    setPrevImage(objectUrl)
    setUploadError('')
  }

  if (!selectedServer.channels || selected.serverID === null) {
    return (
      <div className={`${selected.focus === 'all' || selected.focus === 'center' ? 'flex' : 'hidden'} w-full h-screen flex-col justify-center items-center text-gray-200 gap-5 bg-[#121214] text-sm`}>
        There is nothing here...
      </div>
    )
  }

  const currentServerUser = selectedServer.serverUsers.find(u => u.userId === user.userId)
  const canWrite = selectedChannel
    && currentServerUser
    && (
      selectedServer.owner === user.userId
      || access.manageChannels
      || selectedChannel.access.write.includes(currentServerUser.roles[0])
    )

  return (
    <div className={`${selected.focus === 'all' || selected.focus === 'center' ? 'flex' : 'hidden'} w-full h-screen flex-col text-sm bg-[#121214]`}>
      {selectedChannel ? (
        selectedChannel.type === 'Voice' ? (
          <div className="flex flex-col h-full relative w-full">
            <MobileNavigation selected={selected} setSelected={setSelected} selectedServer={selectedServer} />
            <VoiceCallUI channel={selectedChannel} server={selectedServer} user={user} access={access} />
          </div>
        ) : (
          <div className="flex flex-col justify-between h-full relative w-full">
            <MobileNavigation selected={selected} setSelected={setSelected} selectedServer={selectedServer} />

            <ul ref={chatAreaRef} className={`overflow-auto flex-1 ${window.innerWidth < 640 ? 'mt-14' : ''}`}>
              {selectedChannel.messages.map((msg, index) => (
                <div
                  key={index}
                  className="flex space-x-5 m-5 p-2 rounded-xl items-start break-words relative group hover:bg-[#1a191e]"
                >
                  {msg.messageType === 'Message' ? (
                    <>
                      <img src={msg.user.imageUrl} alt="" className="w-8 h-8 rounded-full absolute top-2.5" />
                      <div className="pl-10 w-full">
                        <p>
                          <span style={{ color: selectedServer.serverRoles?.find(r => r.name === msg.user.roles?.[0])?.color }}>
                            {msg.user.name}
                          </span>
                          {selectedServer.owner === msg.user.userId && (
                            <FontAwesomeIcon icon={faCrown} className="text-orange-400 ml-1" />
                          )}
                          <span className="text-gray-500 text-xs ml-2">{formatTimestamp(msg.timestamp)}</span>
                        </p>
                        {msg.message && <p className="text-slate-100 text-xs break-words max-w-[1350px] mt-0.5">{msg.message}</p>}
                        {msg.file && (
                          msg.fileType === 'video' ? (
                            <video src={msg.file} controls className="py-2 w-96 max-w-full rounded-md" />
                          ) : (
                            <img src={msg.file} alt="attachment" className="py-2 w-96 max-w-full rounded-md" />
                          )
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-2 items-center">
                      {msg.messageType === 'joinServer'
                        ? <FontAwesomeIcon icon={faArrowRightLong} className="text-green-600" />
                        : <FontAwesomeIcon icon={faArrowLeftLong} className="text-red-600" />
                      }
                      <p style={{ color: selectedServer.serverRoles?.find(r => r.name === msg.user.roles?.[0])?.color }}>
                        {msg.user.name}
                      </p>
                      <p className="text-gray-100 text-xs break-words max-w-[1350px]">{msg.message}</p>
                      <span className="text-gray-500 text-xs">{formatTimestamp(msg.timestamp)}</span>
                    </div>
                  )}

                  {(msg.user.userId === user.userId || access.manageMessages) && (
                    <div className="-top-3 right-5 absolute bg-[#1a191e] rounded-md border-2 border-[#2e2d33] hidden group-hover:flex">
                      <button onClick={() => removeMessage(msg)} className="p-2 hover:bg-[#232227]">
                        <FontAwesomeIcon icon={faTrash} className="text-red-500 text-xs" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </ul>

            <form
              onSubmit={sendMessage}
              className={`p-1 mb-4 mx-3 flex flex-col rounded-lg ${canWrite ? 'bg-[#1a191e]' : 'bg-[#161519] cursor-not-allowed'}`}
            >
              {uploadError && (
                <p className="text-red-400 text-xs px-3 pt-2">{uploadError}</p>
              )}

              {prevImage && (
                <div className="flex items-start w-fit p-2">
                  {selectedFile?.type.startsWith('video/') ? (
                    <video src={prevImage} controls className="w-52 rounded-md p-2 pt-7 bg-[#161519]" />
                  ) : (
                    <img src={prevImage} alt="preview" className="w-52 rounded-md p-2 pt-7 bg-[#161519]" />
                  )}
                  <span
                    onClick={clearAttachment}
                    className="p-1 relative right-3 -top-2 bg-[#1a191e] hover:bg-[#232227] cursor-pointer border border-[#2e2d33]"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-red-500 text-xs" />
                  </span>
                </div>
              )}

              <div className="flex">
                <div className="flex items-center justify-center m-2 px-4 py-2">
                  <input type="file" accept="image/*,video/*" className="hidden" onChange={fileSelectHandler} />
                  <FontAwesomeIcon
                    icon={faPlus}
                    className={`w-3.5 h-3.5 fixed text-sm p-1 mx-2 flex items-center justify-center rounded-full ${
                      canWrite && !uploading ? 'text-[#1a191e] bg-gray-100 cursor-pointer' : 'text-[#121214] bg-gray-400 cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (!canWrite || uploading) return
                      document.querySelector('input[type="file"]')?.click()
                    }}
                  />
                </div>

                {canWrite ? (
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={uploading}
                    className="bg-transparent border-0 text-sm focus:ring-0 p-1 focus:outline-none overflow-auto w-full text-white truncate"
                    placeholder={uploading ? 'Uploading…' : `Message #${selectedChannel.name}`}
                  />
                ) : (
                  <input
                    type="text"
                    readOnly
                    className="bg-transparent border-0 text-sm focus:ring-0 p-1 focus:outline-none overflow-auto w-full text-white truncate cursor-not-allowed"
                    placeholder="You do not have permission to send messages in this channel."
                  />
                )}
              </div>
            </form>
          </div>
        )
      ) : (
        <div className="flex flex-col justify-center items-center w-full h-full text-gray-200 gap-5">
          There is nothing here...
        </div>
      )}
    </div>
  )
}

export default ChatBox
