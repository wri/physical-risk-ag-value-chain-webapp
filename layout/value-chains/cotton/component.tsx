import { COTTON } from 'layout/intro-header/constants';
import { ValueChainPageProps } from 'types/value-chain';
import LayoutCrop from 'layout/value-chains';
import details, { quotes } from './constants';

const LayoutCotton = ({ countries, country }: ValueChainPageProps) => {
  return (
    <LayoutCrop
      crop="cotton"
      header={COTTON}
      details={details}
      countries={countries}
      quotes={quotes[country.iso]?.quotes}
    />
  );
};

export default LayoutCotton;
