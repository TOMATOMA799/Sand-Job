import React, { useState } from 'react'
import { useAuth } from '../../AuthContext'
import { getDefaultServer } from './data/staticData'
import ServerSelect from './components/ServerSelect'
import Channels from './components/Channels'
import ChatBox from './components/ChatBox'
import Users from './components/Users'
import PopupManager from './popups/PopupManager'

const DirectMessages = () => {
  const { user } = useAuth()
  const [data, setData] = useState([getDefaultServer()])
  const [selected, setSelected] = useState({
    serverID: data[0]._id,
    channelID: data[0].channels[0]._id,
    focus: window.innerWidth < 640 ? 'left' : 'all',
  })
  const [popup, setPopup] = useState({ showPopup: false })
  const [filterMenu, setFilterMenu] = useState({})
  const [input, setInput] = useState({})

  if (!user) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#121214] text-gray-300 text-sm">
        Signed in, but no matching profile was found.
      </div>
    )
  }

  const selectedServer = data.find((server) => server._id === selected.serverID) || ''

  function setServer(updatedServer) {
    setData((prev) => prev.map((server) => server._id === updatedServer._id ? updatedServer : server))
  }

  const role = selectedServer
    ? selectedServer.serverRoles.find((r) => r.name === selectedServer.serverUsers.find((u) => u.userId === user.userId)?.roles[0])
    : null
  const access = role ? role.access : {}

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <ServerSelect selected={selected} setSelected={setSelected} data={data} user={user} />
      <Channels
        selected={selected}
        setSelected={setSelected}
        selectedServer={selectedServer}
        setData={setData}
        user={user}
        popup={popup}
        setPopup={setPopup}
        access={access}
        input={input}
        setInput={setInput}
      />
      <ChatBox
        selected={selected}
        setSelected={setSelected}
        selectedServer={selectedServer}
        setServer={setServer}
        access={access}
        popup={popup}
        setPopup={setPopup}
        user={user}
      />
      <Users selectedServer={selectedServer} selected={selected} setSelected={setSelected} />
      <PopupManager
        popup={popup}
        setPopup={setPopup}
        selectedServer={selectedServer}
        selected={selected}
        setSelected={setSelected}
        input={input}
        setInput={setInput}
        filterMenu={filterMenu}
        setFilterMenu={setFilterMenu}
        access={access}
        user={user}
      />
    </div>
  )
}

export default DirectMessages
