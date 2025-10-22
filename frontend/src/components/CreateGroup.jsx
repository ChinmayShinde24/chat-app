import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import GroupModal from './GroupModal';

const CreateGroup = () => {

    const [showCreateGroup,setShowCreateGroup] = useState(false)



  return (
    <div className="relative w-full mt-4">
      <button 
        className="absolute -right-2 bg-[#6C63FF] hover:bg-[#5a52e0] text-white rounded-full p-3 shadow-lg transition-colors duration-200 flex items-center justify-center"
        style={{bottom:"-330px"}}
        onClick={() => setShowCreateGroup(true)}
        aria-label="Create new group"
      >
        <Plus size={20} />
      </button>

    {
        showCreateGroup && (
            <GroupModal onClose={()=>setShowCreateGroup(false)}/>
        )
    }

    </div>
  );
};

export default CreateGroup;