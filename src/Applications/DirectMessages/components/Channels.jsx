import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHashtag, faVolumeHigh, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../../AuthContext'

const Channels = ({ selected, setSelected, selectedServer, user, access }) => {
  const [socket, setSocket] = useState(null)
  const { logOut } = useAuth()

  useEffect(() => {
    const sock = io(process.env.REACT_APP_SERVER)
    setSocket(sock)
    return () => sock.disconnect()
  }, [])

  const truncateText = (text) => {
    const safeText = text ?? ''
    const limit = window.innerWidth < 640 ? (window.innerWidth < 450 ? 20 : 38) : 20
    return safeText.length > limit ? safeText.slice(0, limit) + '...' : safeText
  }

  const currentUser = selectedServer.serverUsers.find((u) => u.userId === user.userId)

  return (
    <div
      className={`sm:w-[240px] sm:min-w-[240px] sm:max-w-[240px] w-full ${
        selected.focus === 'all' || selected.focus === 'left' ? 'flex flex-col' : 'hidden'
      } h-screen bg-[#1a191e] text-white relative justify-between`}
    >
      {selectedServer.channels && currentUser ? (
        <div className="flex-1 overflow-y-auto pb-10">
          <div className="px-5 py-3 text-sm font-semibold">
            {truncateText(selectedServer.name)}
          </div>

          {selectedServer.channels.map((channel, index) => {
            const canRead =
              selectedServer.owner === user.userId
              || access.manageChannels
              || (channel.type === 'Voice'
                  ? channel.voiceAccess?.connect?.includes(currentUser.roles[0])
                  : channel.access.read.includes(currentUser.roles[0]))

            if (!canRead) return null

            return (
              <div
                key={index}
                onClick={() => {
                  if (selected.channelID !== channel._id) {
                    setSelected({
                      ...selected,
                      channelID: channel._id,
                      focus: window.innerWidth < 640 ? 'center' : 'all',
                    })
                  }
                }}
                className={`flex items-center h-7 mx-2 my-1 px-2 cursor-pointer rounded-md transition-all ${
                  selected.channelID === channel._id ? 'bg-[#232227]' : 'hover:bg-[#232227]'
                }`}
              >
                <span className="text-sm text-[#80848E] flex gap-1 items-center flex-1">
                  {channel.type === 'Text'
                    ? <FontAwesomeIcon icon={faHashtag} className="mx-0.5" />
                    : <FontAwesomeIcon icon={faVolumeHigh} />
                  }
                  <span className={selected.channelID === channel._id ? 'text-white' : ''}>
                    {truncateText(channel.name)}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="absolute w-full top-1 h-10 flex flex-col items-center">
          <button
            type="button"
            className="px-2 py-1 mx-2 w-[90%] text-xs text-left text-gray-400 rounded-sm bg-[#0e0e10] border-0 outline-none"
          >
            Start a conversation
          </button>
        </div>
      )}

      <div className="bg-[#0e0e10] absolute bottom-0 w-full h-10 flex items-center px-2 gap-2">
        <img
          src={user.imageUrl || '/Assets/profile.png'}
          alt=""
          className="w-6 h-6 rounded-full"
          onError={(e) => { e.currentTarget.src = '/Assets/profile.png' }}
        />
        <p className="text-sm flex-1 truncate">{truncateText(user.name || user.username)}</p>
        <button onClick={logOut} className="text-gray-300 hover:text-white">
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
        </button>
      </div>
    </div>
  )
}

export default Channels
