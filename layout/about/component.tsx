import IntroHeader from 'layout/intro-header';
import Layout from 'layout/layout/layout-app';
import { ABOUT } from 'layout/intro-header/constants';
import acknowledgements from 'layout/about/constants';
import Image from 'next/image';
import classnames from 'classnames';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

const LayoutAbout = () => {
  const { t } = useTranslation(['about']);

  return (
    <Layout>
      <div className="l-about">
        <IntroHeader {...ABOUT} />
        <div className="c-about-body">
          <div className="l-container">
            {Object.entries(acknowledgements).map(([key, val]) => {
              const { header, subheader, content } = val;
              return (
                <div key={key} className="c-acknowledgement">
                  {header && <h2>{t(header)}</h2>}
                  {subheader && <h3>{t(subheader)}</h3>}
                  <div
                    className={classnames({
                      'c-logo-container': content.every((c) => 'image' in c),
                    })}
                  >
                    {key!=='committee_members' && 
                    content.map((c) => (
                        <div key={c.name} className="c-logo">
                          <Link href={c.href} passHref>
                            <a target="_blank">
                              <Image
                                loader={({ src }) => src}
                                src={c.image}
                                alt={c.name}
                              />
                            </a>
                          </Link>
                        </div>)
                    )}
                    {key==='committee_members' && (<p>{
                      content.map((c) => (
                      <p key={c.name}>
                        <Link  href={c.href} passHref>
                          <a target="_blank">{c.name}</a>
                        </Link>
                      </p>  
                      ))
                    }
                    </p>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LayoutAbout;
