import { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import './Accordion.scss';

function Panel({label, content, activeTab, index, activateTab}: any) {
    const [height, setHeight] = useState(0);
    const element = useRef(null);
    const isActive = activeTab === index;
    const innerStyle = {
        height:  `${isActive ? height : 0}px`
    }

    useEffect(() => {
        window.setTimeout(() => {
            const el = ReactDOM.findDOMNode(element.current) as Element;
            const height = el.querySelector('.panel__inner')!.scrollHeight;
            setHeight(height);
        }, 300);
    }, []);

    return (
        <div ref={element}
             className='panel'
             role='tabpanel'
             aria-expanded={ isActive }>
            <button className='panel__label'
                    role='tab'
                    onClick={ activateTab }>
                { label }
            </button>
            <div className='panel__inner'
                 style={ innerStyle }
                 aria-hidden={ !isActive }>
                <div className='panel__content'>
                    { content }
                </div>
            </div>
        </div>
    );
}

function Accordion({panels}: any) {
    const [activeTab, setActiveTab] = useState(-1);

    const handleActivateTab = useCallback((index) => {
        setActiveTab(prev => (prev === index ? -1 : index));
    }, []);

    return (
        <div className='accordion' role='tablist'>
            {panels.map((panel: any, index: number) =>
                <Panel
                    key={ index }
                    activeTab={ activeTab }
                    index={ index }
                    {...panel}
                    activateTab={ () => handleActivateTab(index) }
                />
            )}
        </div>
    );
}

export default Accordion;
