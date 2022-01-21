import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';

import './NavList.scss';

interface NavListProps {
  links: {
    to: string;
    value: string;
  }[];
}

export function NavList({ links }: NavListProps) {
  const navListRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const [activeLink, setActiveLink] = useState(0);

  const setUnderlinePosition = useCallback((target: HTMLDivElement) => {
    if (target && underlineRef.current) {
      underlineRef.current.style.left = `${target.offsetLeft}px`;
      underlineRef.current.style.width = `${target.offsetWidth}px`;
    }
  }, []);

  useLayoutEffect(() => {
    if (navListRef.current && underlineRef.current) {
      setUnderlinePosition(navListRef.current.children[activeLink] as HTMLDivElement);
    }
  }, [setUnderlinePosition, activeLink]);

  const mouseEnterHandler = useCallback(
    (event) => {
      if (underlineRef.current) {
        setUnderlinePosition(event.target);
      }
    },
    [setUnderlinePosition],
  );

  const mouseLeaveHandler = useCallback(
    (event) => {
      if (underlineRef.current && navListRef.current) {
        setUnderlinePosition(navListRef.current.children[activeLink] as HTMLDivElement);
      }
    },
    [setUnderlinePosition, activeLink],
  );

  const isActiveHandler = useCallback((index: number, value: { isActive: boolean }) => {
    if (value.isActive) {
      setTimeout(() => {
        setActiveLink(index);
      });
    }
    return `nav-item__btn title-1 ${value.isActive ? 'active' : ''}`;
  }, []);

  return (
    <nav className="nav-wrapper">
      <div ref={navListRef} className="nav-list">
        {links.map((link, index) => {
          return (
            <div key={index} className="nav-item">
              <NavLink
                className={isActiveHandler.bind(null, index)}
                to={link.to}
                onMouseEnter={mouseEnterHandler}
                onMouseLeave={mouseLeaveHandler}
              >
                {link.value}
              </NavLink>
            </div>
          );
        })}
        <div ref={underlineRef} className="nav-item__underline" />
      </div>
    </nav>
  );
}
