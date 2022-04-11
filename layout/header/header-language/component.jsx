import { useState } from 'react';
import Link from 'next/link';
import { useDebouncedCallback } from 'use-debounce';
import Tether from 'react-tether';

import { APP_HEADER_ITEMS } from "layout/header/constants";
import Icon from 'components/ui/icon';

export default function HeaderLanguage() {
    const [isVisible, setVisibility] = useState(false);
    const [prefLanguage, setPrefLanguage] = useState('English'); // UPDATE WITH REDUCER
    const toggleDropdown = useDebouncedCallback((_isVisible) => {
        setVisibility(_isVisible);
    }, 50);

    const changeLanguage = (language) => {
        setPrefLanguage(language);
        // add api call
        // api response text should update entire website text via reducers 
        // each page should request text from reducers
    }

    // TO DO: might need to update element iteration with additional nav links
    const featuredLanguages = APP_HEADER_ITEMS[APP_HEADER_ITEMS.length - 1].children;
    return (
      <Tether
        attachment="top center"
        constraints={[
          {
            to: 'window',
          },
        ]}
        classes={{ element: 'c-header-dropdown' }}
        renderTarget={(ref) => (
          <Link href="/">
            <a
              ref={ref}
              onMouseEnter={() => toggleDropdown(true)}
              onMouseLeave={() => toggleDropdown(false)}
            >
              <Icon
                name="language-globe"
                className="c-icon dropdown-link-image -small"
              />
              {prefLanguage}
              <Icon
                name="down-caret"
                className="c-icon dropdown-link-image -smaller"
              />
            </a>
          </Link>
        )}
        renderElement={(ref) => {
          if (!isVisible || !featuredLanguages.length) return null;

          return (
            <ul
              ref={ref}
              className="header-dropdown-list"
              onMouseEnter={() => toggleDropdown(true)}
              onMouseLeave={() => toggleDropdown(false)}
            >
              {featuredLanguages.map(({ id, label }) => (
                <li
                  className="header-dropdown-list-item"
                  key={id}
                  onClick={(e) => {
                    changeLanguage(e.target.innerText);
                  }}
                >
                  <a>{label}</a>
                </li>
              ))}
            </ul>
          );
        }}
      />
    );
}
