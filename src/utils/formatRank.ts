export const formatRank = (rank: number): string => {
  if (rank < 1000) {
    return rank.toString();
  } else if (rank < 10000) {
    return (rank / 1000).toFixed(1) + 'K';
  } else if (rank < 1000000) {
    return Math.floor(rank / 1000) + 'K';
  } else {
    return (rank / 1000000).toFixed(1) + 'M';
  }
};
