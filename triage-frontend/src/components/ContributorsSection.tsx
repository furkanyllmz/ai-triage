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
    firstName: "Ahmet",
    lastName: "Yılmaz",
    title: "Başhekim"
  },
  {
    id: 2,
    firstName: "Fatma",
    lastName: "Demir",
    title: "Senior Developer"
  },
  {
    id: 3,
    firstName: "Mehmet",
    lastName: "Kaya",
    title: "Başhemşire"
  },
  {
    id: 4,
    firstName: "Ayşe",
    lastName: "Özkan",
    title: "Lead Designer"
  },
  {
    id: 5,
    firstName: "Mustafa",
    lastName: "Çelik",
    title: "6. Sınıf Öğrencisi"
  },
  {
    id: 6,
    firstName: "Zeynep",
    lastName: "Arslan",
    title: "Project Manager"
  },
  {
    id: 7,
    firstName: "Emre",
    lastName: "Şahin",
    title: "Uzman Doktor"
  },
  {
    id: 8,
    firstName: "Seda",
    lastName: "Koç",
    title: "QA Engineer"
  },
  {
    id: 9,
    firstName: "Ali",
    lastName: "Veli",
    title: "Acil Servis Hemşiresi"
  },
  {
    id: 10,
    firstName: "Can",
    lastName: "Yılmaz",
    title: "Prof. Dr."
  },
  {
    id: 11,
    firstName: "Elif",
    lastName: "Türk",
    title: "Acil Tıp Uzmanı"
  },
  {
    id: 12,
    firstName: "Burak",
    lastName: "Öztürk",
    title: "Teknik Direktör"
  }
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
