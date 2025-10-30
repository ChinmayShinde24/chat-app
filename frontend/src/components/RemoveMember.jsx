import React from 'react'
import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

const RemoveMember = ({ member, groupId }) => {
    const { removeUserFromGroup } = useContext(ChatContext);

    const handleRemoveUser = async () => {
        if (member && groupId) {
            alert(`Removing ${member.fullName || 'Unknown User'}`);
            await removeUserFromGroup(groupId, member._id);
        }
    }

    return(
        <div className='bg-red-600' style={{padding:"5px 10px"}}>
            <button onClick={handleRemoveUser}>Remove</button>
        </div>
    )
}
export default RemoveMember;