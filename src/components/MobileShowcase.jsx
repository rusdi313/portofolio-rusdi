import React, { useState, useEffect } from 'react';

const MobileShowcase = () => {
    const screenshots = [
        "/project1.png", 
        "/project2.png", 
        "/project3.png",
    ];

    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % screenshots.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [screenshots.length]);

    const getPosition = (index) => {
        if (index === activeIndex) return "center";
        if (index === (activeIndex + 1) % screenshots.length) return "right";
        return "left";
    };

    const getStyles = (position) => {
        // PERUBAHAN DISINI:
        // Kita gunakan w-[140px] untuk HP (kecil) dan sm:w-[240px] untuk Laptop (besar)
        // Tinggi juga disesuaikan h-[280px] vs sm:h-[480px]
        const baseClasses = "absolute transition-all duration-700 ease-in-out rounded-[1.5rem] border border-white/10 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.6)] overflow-hidden bg-black";
        
        // Ukuran Responsif: Mobile Kecil | Desktop Besar
        const sizeClasses = "w-[140px] h-[280px] sm:w-[240px] sm:h-[480px]";

        switch (position) {
            case "center":
                return {
                    className: `${baseClasses} ${sizeClasses} z-20 opacity-100`,
                    style: { 
                        left: "50%", 
                        transform: "translateX(-50%)",
                    }
                };
            case "right":
                return {
                    className: `${baseClasses} ${sizeClasses} z-10 opacity-50 grayscale-[30%] blur-[0.5px]`,
                    style: { 
                        left: "80%", // Geser lebih rapat di mobile agar tidak keluar layar
                        transform: "translateX(-50%) perspective(1000px) rotateY(-20deg) scale(0.85)",
                    }
                };
            case "left":
                return {
                    className: `${baseClasses} ${sizeClasses} z-10 opacity-50 grayscale-[30%] blur-[0.5px]`,
                    style: { 
                        left: "20%", 
                        transform: "translateX(-50%) perspective(1000px) rotateY(20deg) scale(0.85)",
                    }
                };
            default:
                return {};
        }
    };

    return (
        // Container height juga responsif: h-[350px] di HP, h-full di Laptop
        <div className="relative w-full h-[350px] sm:h-full min-h-[350px] py-10 flex items-center justify-center overflow-visible">
            
            <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
                {screenshots.map((img, index) => {
                    const position = getPosition(index);
                    const { className, style } = getStyles(position);

                    return (
                        <div key={index} className={className} style={style}>
                            <img 
                                src={img} 
                                alt={`Project ${index + 1}`} 
                                className="w-full h-full object-cover"
                            />
                            {/* Glossy Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/15 via-transparent to-transparent pointer-events-none z-20"></div>
                            {/* Inner Shadow */}
                            <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.6)] pointer-events-none z-30 rounded-[1.5rem]"></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileShowcase;