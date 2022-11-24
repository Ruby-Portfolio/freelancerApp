export const getFreelancerCacheKey = ({
  keyword,
  page,
}: {
  keyword: string;
  page: number;
}) => {
  return `freelancers_${keyword || 'all'}_${page}`;
};
