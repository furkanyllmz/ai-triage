import React, { useState, useEffect } from 'react';
import './ContributorsSection.css';

interface Contributor {
  id: number;
  firstName: string;
  lastName: string;
  title: string;
}

const contributorsData: Contributor[] = [
  {
    id: 1,
    firstName: "Nursima",
    lastName: "Çörten",
    title: "3.Sınıf Tıp Öğrencisi"
  },
  {
    id: 2,
    firstName: "Miralay",
    lastName: "Aksoy",
    title: "4.Sınıf Tıp Öğrencisi"
  },
  {
    id: 3,
    firstName: "Ömer",
    lastName: "Coşkun",
    title: "4.Sınıf Tıp Öğrencisi"
  },
  {
    id: 4,
    firstName: "Yusuf Furkan",
    lastName: "Seçkin",
    title: "4.Sınıf Tıp Öğrencisi"
  },
  {
    id: 5,
    firstName: "Celal",
    lastName: "Ertürk",
    title: "4.Sınıf Tıp Öğrencisi"
  },
  {
    id: 6,
    firstName: "Mehmet Efe",
    lastName: "Calap",
    title: "4.Sınıf Tıp Öğrencisi"
  },
  {
    id: 7,
    firstName: "Ramazan",
    lastName: "Yazgan",
    title: "4.Sınıf Tıp Öğrencisi"
  },
  {
    id: 8,
    firstName: "İlker",
    lastName: "Lafçı",
    title: "Acil Servis Hemşiresi"
  },
  
];

const ContributorsSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const contributors = contributorsData.slice(0, 10);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % contributors.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [contributors.length]);

  return (
    <div className="contributors-section">
      <div className="section-header">
        <div className="section-title-with-heart">
          <h2 className="section-title">Katkıda Bulunanlar</h2>
          <span className="heart-icon">❤️</span>
        </div>
        <p className="section-subtitle">
          E-Triaj sisteminin geliştirilmesinde emeği geçen değerli katkıda bulunanlarımız
        </p>
      </div>
      
      <div className="contributors-container">
        <div className="contributors-grid">
          {contributors.map((contributor: Contributor, index: number) => (
            <div
              key={contributor.id}
              className={`contributor-card ${
                activeIndex === index ? 'active' : ''
              } ${hoveredIndex === index ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="contributor-info">
                <h3 className="contributor-name">
                  {contributor.firstName} {contributor.lastName}
                </h3>
                <div className="contributor-title-hover">
                  {contributor.title}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="contributors-indicators">
          {contributors.map((_: Contributor, index: number) => (
            <div
              key={index}
              className={`indicator ${activeIndex === index ? 'active' : ''}`}
            >
              <span className="indicator-heart">❤️</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContributorsSection;
