import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrophone } from '@fortawesome/free-solid-svg-icons'

const VoiceCallUI = ({ channel }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400 bg-[#121214]">
      <FontAwesomeIcon icon={faMicrophone} className="text-4xl" />
      <p className="text-sm">Voice chat for #{channel?.name} is coming soon.</p>
    </div>
  )
}

export default VoiceCallUI
