import './InterestTag.css';

interface InterestTagProps {
  interest: string;
}

const InterestTag = ({ interest }: InterestTagProps) => {
  return (
    <span className="interest-tag">
      {interest}
    </span>
  );
};

export default InterestTag;

