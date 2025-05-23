import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hashtag = ({ tag }) => {
  const navigate = useNavigate();

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/hashtag/${tag}`);
  };

  return (
    <span className="hashtag" onClick={handleClick}>
      #{tag}
    </span>
  );
};

export default Hashtag;
