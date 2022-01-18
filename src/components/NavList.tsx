import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import './NavList.scss';


interface NavListProps {
    links: {
        to: string,
        value: string,
    }[];
}

function NavList({links}: NavListProps) {
    const navListRef = useRef<HTMLDivElement>(null);
    const underlineRef = useRef<HTMLDivElement>(null);
    const [activeLink, setActiveLink] = useState(0);

    useLayoutEffect(() => {
        if (navListRef.current && underlineRef.current) {
            underlineRef.current.style.left = `${(navListRef.current.children[activeLink] as HTMLDivElement).offsetLeft}px`;
            underlineRef.current.style.width = `${(navListRef.current.children[activeLink] as HTMLDivElement).offsetWidth}px`;
        }
    }, [activeLink])

    const mouseEnterHandler = useCallback((event) => {
        if (underlineRef.current) {
            underlineRef.current.style.left = `${event.target.offsetLeft}px`;
            underlineRef.current.style.width = `${event.target.outerWidth}px`;
        }
    }, []);

    const mouseLeaveHandler = useCallback((event) => {
        if (underlineRef.current && navListRef.current) {
            underlineRef.current.style.left = `${(navListRef.current.children[activeLink] as HTMLDivElement).offsetLeft}px`;
            underlineRef.current.style.width = `${(navListRef.current.children[activeLink] as HTMLDivElement).offsetWidth}px`;
        }
    }, [activeLink]);

    return (
        <nav className="nav-wrapper">
            <div ref={navListRef} className="nav-list">
                {
                    links.map((link, index) => {
                        const isActive = (props: {isActive: boolean}) => {
                            if (props.isActive) {
                                setActiveLink(index);
                            }
                            return `nav-item__btn title-1 ${props.isActive ? 'active' : ''}`;
                        }

                        return <div key={index}
                                    className="nav-item">
                            <NavLink className={isActive}
                                     to={link.to}
                                     onMouseEnter={mouseEnterHandler}
                                     onMouseLeave={mouseLeaveHandler}
                            >
                                {link.value}
                            </NavLink>
                        </div>;
                    })
                }
                <div ref={underlineRef} className="nav-item__underline" />
            </div>
        </nav>
    )
}

export default NavList;