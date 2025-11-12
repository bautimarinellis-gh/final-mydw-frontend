import InterestTag from '../InterestTag';
import { SearchIcon } from '../icons';
import './Interests.css';

interface InterestsProps {
  intereses: string[];
}

const Interests = ({ intereses }: InterestsProps) => {
  return (
    <div className="interests-section">
      <h3 className="interests-title">Intereses</h3>
      {intereses && intereses.length > 0 ? (
        <div className="interests-chips">
          {intereses.slice(0, 5).map((interes, index) => (
            <InterestTag key={index} interest={interes} />
          ))}
        </div>
      ) : (
        <p className="interests-empty">
          <SearchIcon size={16} className="interests-icon" />
          Sumá intereses para que te encuentren
        </p>
      )}
    </div>
  );
};

export default Interests;

