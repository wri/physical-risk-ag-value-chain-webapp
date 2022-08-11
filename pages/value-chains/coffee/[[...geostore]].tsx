import LayoutCoffee from 'layout/value-chains/coffee';
import { actions } from 'layout/value-chains/reducers';
import { wrapper } from 'lib/store';
import { GetServerSideProps } from 'next';
import { fetchCountries, fetchGeostore } from 'services/geostore';
import { ValueChainPageProps } from 'types/value-chain';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import DROPDOWN from 'public/data/coffee_countries.json';
import india_worldview_geostore from 'public/data/india_worldview_geostore.json';
const CoffeeCountryPage = (props: ValueChainPageProps) => {
  return <LayoutCoffee {...props} />;
};

const CROP = 'coffee';

const default_country = {
  label: 'Colombia',
  value: '298fc2cf079fb1439a4ad816d258a965',
  iso: 'COL',
};

export const getServerSideProps: GetServerSideProps =
  wrapper.getServerSideProps((store) => async ({ query, locale, req }) => {
    const { geostore } = query;
    const { dispatch } = store;
    const viewer_iso2 = req.headers['cloudfront-viewer-country'];
    if (viewer_iso2 === 'IN' && geostore === 'fb119d758d39527a91307b7fed3debf4')
      return {
        redirect: {
          destination: '/value-chains/coffee/1252b02f0a27cf77fd19b8298be6a8db',
          permanent: false,
        },
      };

    const country =
      geostore &&
      (await fetchGeostore(
        Array.isArray(geostore) ? geostore.join('') : geostore
      )
        .then(({ id, info: { name, iso } }) => ({
          label: name,
          value: id,
          iso,
        }))
        .catch(() => console.error('Error fetching geostore')));

    if (country) dispatch(actions.setCountry(country));
    else dispatch(actions.setCountry(default_country));

    dispatch(actions.setActiveCrop(CROP));

    const countries = (await fetchCountries()).reduce((arr, geo) => {
      if (!geo.name || !DROPDOWN.countries.includes(geo.name)) return arr;

      const { name: label, geostoreId: value, iso } = geo;
      if (iso === 'IND' && viewer_iso2 === 'IN')
        arr.push(india_worldview_geostore);
      else arr.push({ label, value, iso });
      return arr;
    }, []);

    return {
      props: {
        ...(await serverSideTranslations(locale, [
          CROP,
          'common',
          'countries',
          'header',
          'footer',
          'widgets',
        ])),
        countries,
      },
    };
  });

export default CoffeeCountryPage;
