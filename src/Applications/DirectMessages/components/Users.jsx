import { faCrown, faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { MobileNavigation } from './MobileNavigation'

const Users = ({ selectedServer, selected, setSelected }) => {
  const [collapsed, setCollapsed] = useState(false)

  const getRoleCount = (roleName) => {
    return selectedServer.serverUsers.filter(user => user.roles[0] === roleName).length
  }

  if (collapsed) {
    return (
      <div className={`${selected.focus === 'right' || selected.focus === 'all' ? 'flex' : 'hidden'} w-8 min-w-[32px] h-screen bg-[#1a191e] flex-col items-center pt-3`}>
        <button
          onClick={() => setCollapsed(false)}
          title="Show members"
          className="text-gray-400 hover:text-white p-1"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
        </button>
      </div>
    )
  }

  return (
    <div className={`${selected.serverID !== null && selectedServer !== '' ? 'sm:w-[200px] sm:min-w-[200px] w-full' : null} ${selected.focus === 'right' || selected.focus === 'all' ? 'block' : 'hidden'} h-screen bg-[#1a191e] relative`}>
      {selected.serverID !== null && selectedServer !== '' ? (
        <MobileNavigation selected={selected} setSelected={setSelected} selectedServer={selectedServer} />
      ) : null}
      <button
        onClick={() => setCollapsed(true)}
        title="Hide members"
        className="absolute top-2 right-2 text-gray-400 hover:text-white z-10"
      >
        <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
      </button>
      {selected.serverID !== null && selectedServer !== '' ? (
        <div className={selected.serverID !== null && selectedServer !== '' ? (window.innerWidth < 640 ? 'mt-16' : 'mt-5') : null}>
          {selectedServer.serverRoles.map((role, index) => (
            selectedServer.serverUsers.some(user => user.roles[0] === role.name) ? (
              <div key={index} className="text-sm">
                <span className="mx-5 mt-4 flex text-gray-200">{role.name} - {getRoleCount(role.name)}</span>
                {selectedServer.serverUsers.map((user, userIndex) => (
                  user.roles[0] === role.name ? (
                    <div
                      key={userIndex}
                      className="flex items-center h-10 mt-1 pl-3 mx-2 rounded-md bg-[#1a191e]"
                    >
                      <img className="w-7 h-7 rounded-full" src={user.imageUrl} alt="user" />
                      <p className="ml-2 text-sm" style={{ color: role.color }}>
                        {user.name} {selectedServer.owner === user.userId && <FontAwesomeIcon icon={faCrown} className="text-orange-400" />}
                      </p>
                    </div>
                  ) : null
                ))}
              </div>
            ) : null
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default Users
