import React from 'react'

const ServerSelect = ({ selected, setSelected, data, user }) => {
  function selectedUpdate(id) {
    const result = data.map(server => server._id === id && server.channels.map(channel => channel._id === selected.channelID))
    const hasTrue = result.flat().includes(true)
    if (!hasTrue) {
      data.map(server => server._id === id &&
        ((window.innerWidth >= 640)
          ? setSelected({ ...selected, serverID: id, channelID: server.owner === user.userId ? server.channels[0]._id : server.channels.find((channel) => (channel.access.read).includes(server.serverUsers.find(u => u.userId === user.userId).roles[0]))._id })
          : setSelected({ serverID: id, channelID: null, focus: 'left' })))
    } else {
      setSelected({ ...selected, serverID: id })
    }
  }

  return (
    <div className={`w-[3%] min-w-[50px] ${selected.focus === 'all' || selected.focus === 'left' ? 'flex flex-col' : 'hidden'} h-screen bg-[#0e0e10] py-5`}>
      <div className="space-y-2">
        {data.map((server, index) => (
          <div key={index} className="flex relative group cursor-pointer" onClick={() => (selected.serverID !== server._id && selectedUpdate(server._id))}>
            <div className={`w-[0.200rem] ${selected.serverID === server._id ? 'h-10 scale-100' : 'h-5 my-2.5'} rounded-r-xl bg-white scale-0 group-hover:scale-100 absolute transition-all duration-300`}></div>
            <div className="flex mx-auto items-center justify-center">
              <img src={server.image} alt="server" className={`w-10 h-10 group-hover:rounded-xl ${selected.serverID === server._id ? 'rounded-xl' : 'rounded-3xl'} transition-all duration-300`} key={server._id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ServerSelect
