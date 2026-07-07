import { MessageSquare, ArrowUp, ArrowDown, Share2 } from 'lucide-react';
import Card from './ui/Card';
import './PostCard.css';

const PostCard = ({ post, onVote }) => {
  const { title, content, author, community, upvotes = 0, flairs = [], createdAt } = post;
  
  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <Card glass className="post-card" padding="none">
      <div className="post-vote-col">
        <button className="vote-btn upvote" onClick={() => onVote(post._id, 'upvote')}>
          <ArrowUp size={20} />
        </button>
        <span className="vote-count">{upvotes}</span>
        <button className="vote-btn downvote" onClick={() => onVote(post._id, 'downvote')}>
          <ArrowDown size={20} />
        </button>
      </div>
      
      <div className="post-content-col">
        <div className="post-header">
          {community && <span className="post-community">c/{community.name}</span>}
          <span className="post-meta">
            • Posted by <span className="post-author">{author?.anonymousName || 'Anonymous'}</span> • {formattedDate}
          </span>
        </div>
        
        <h3 className="post-title">{title}</h3>
        
        {flairs && flairs.length > 0 && (
          <div className="post-flairs">
            {flairs.map((flair, idx) => (
              <span key={idx} className="flair">{flair}</span>
            ))}
          </div>
        )}
        
        <p className="post-text">{content}</p>
        
        <div className="post-actions">
          <button className="action-btn">
            <MessageSquare size={16} />
            <span>Comments</span>
          </button>
          <button className="action-btn">
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
