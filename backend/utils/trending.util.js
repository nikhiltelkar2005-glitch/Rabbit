/**
 * Calculates a Reddit-style "hot" or trending score.
 * Formula: log10(max(1, |score|)) + (sign(score) * seconds_since_epoch / 45000)
 */
const calculateTrendingScore = (upvotes, downvotes, createdAt) => {
  const score = upvotes - downvotes;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  
  let sign = 0;
  if (score > 0) sign = 1;
  else if (score < 0) sign = -1;
  
  // Convert date to seconds
  const seconds = Math.floor((createdAt || new Date()).getTime() / 1000);
  
  // 45000 seconds = 12.5 hours. 
  // A post needs 10x more score to match a post that is 12.5 hours newer.
  return order + (sign * seconds / 45000);
};

module.exports = { calculateTrendingScore };
