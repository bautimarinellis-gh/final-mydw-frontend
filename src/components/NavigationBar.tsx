import { useNavigate, useLocation } from 'react-router-dom';
import { FireIcon, HeartIcon, UserIcon } from './icons';
import './NavigationBar.css';

interface NavigationBarProps {
  isModalOpen?: boolean;
}

const NavigationBar = ({ isModalOpen = false }: NavigationBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { 
      path: '/discover', 
      icon: FireIcon, 
      label: 'Descubrir' 
    },
    { 
      path: '/matches', 
      icon: HeartIcon, 
      label: 'Matches' 
    },
    { 
      path: '/profile', 
      icon: UserIcon, 
      label: 'Perfil' 
    },
  ];

  return (
    <nav className={`navigation-bar ${isModalOpen ? 'modal-open' : ''}`}>
      {navItems.map((item) => {
        const active = isActive(item.path);
        const IconComponent = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`nav-button ${active ? 'active' : ''}`}
          >
            <span className={`nav-icon ${active ? 'active' : 'inactive'}`}>
              <IconComponent 
                size={22} 
                color={active ? '#8B1538' : '#999999'} 
              />
            </span>
            <span className={`nav-label ${active ? 'active' : 'inactive'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default NavigationBar;

