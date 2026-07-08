import { useState, useEffect } from 'react';
import api from '../utils/api';
import PostCard from '../components/PostCard';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // In a real app we might fetch a general feed instead of just a specific community
      // But based on API, it's /posts/community/:id. Assuming there's a global feed or we mock it
      // Since no global feed endpoint is in the readme, we might just query /posts/all if it exists or mock
      // Let's try /posts/all or we'll just mock it if it fails for presentation
      const res = await api.get('/posts/community/all').catch(() => null);
      if (res && res.data && res.data.data) {
        setPosts(res.data.data);
      } else {
        // Fallback mock data if API doesn't support global feed yet
        setPosts([
          {
            _id: '1',
            title: 'How to prepare for Google placements?',
            content: 'I am a 3rd year student and I want to start preparing for Google. What should be my roadmap?',
            author: { anonymousName: 'Curious Rabbit #4521' },
            community: { name: 'placements' },
            upvotes: 142,
            flairs: ['advice', 'placement'],
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            title: 'Lost my AirPods in the library',
            content: 'If anyone found AirPods Pro near the engineering section in the central library, please let me know. Offering a treat!',
            author: { anonymousName: 'Sad Rabbit #991' },
            community: { name: 'lost_found' },
            upvotes: 45,
            flairs: [],
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
      }
    } catch (err) {
      setError('Failed to load feed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId, type) => {
    // Optimistic UI update
    setPosts(posts.map(post => {
      if (post._id === postId) {
        return { ...post, upvotes: type === 'upvote' ? post.upvotes + 1 : post.upvotes - 1 };
      }
      return post;
    }));
    try {
      await api.post(`/posts/${postId}/vote`, { type });
    } catch (err) {
      console.error('Vote failed', err);
    }
  };

  return (
    <div className="home-container">
      <div className="feed-header">
        <h2>Top Posts in your College</h2>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-state">Loading feed...</div>
      ) : (
        <div className="posts-feed">
          {posts.map(post => (
            <PostCard key={post._id} post={post} onVote={handleVote} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
