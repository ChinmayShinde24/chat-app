import React from "react";
import EmojiPickerReact from "emoji-picker-react";

const EmojiPicker = ({ onEmojiClick }) => {
  return (
    <div className="absolute bottom-14 right-4 z-50">
      <EmojiPickerReact
        onEmojiClick={(emojiData) => onEmojiClick(emojiData.emoji)}
      />
    </div>
  );
};

export default EmojiPicker;
