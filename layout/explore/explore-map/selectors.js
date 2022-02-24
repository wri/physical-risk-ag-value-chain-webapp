import { createSelector, createStructuredSelector } from 'reselect';

// constants
import { BASEMAPS, LABELS } from 'components/map/constants';

// selectors
import {
  getUpdatedLayers,
  getActiveLayers,
  getUpdatedLayerGroups,
  getActiveInteractiveLayers,
} from 'components/map/selectors';

const getLayerGroups = (state) => state.explore.map.layerGroups;
const getParametrization = (state) => state.explore.map.parametrization;
const getBasemapId = (state) => state.explore.map.basemap;
const getLabelId = (state) => state.explore.map.labels;

export const exploreMapGetUpdatedLayerGroups = getUpdatedLayerGroups(getLayerGroups);
export const exploreMapGetActiveLayers = getActiveLayers(getLayerGroups);
export const exploreMapGetUpdatedLayers = getUpdatedLayers(
  exploreMapGetActiveLayers,
  getParametrization,
);
export const exploreMapGetActiveInteractiveLayers = getActiveInteractiveLayers(
  exploreMapGetActiveLayers,
);

export const getBasemap = createSelector(
  [getBasemapId],
  (basemapId) => BASEMAPS[basemapId],
);

export const getLabel = createSelector(
  [getLabelId],
  (labelId) => LABELS[labelId],
);

export const getMapProps = createStructuredSelector({
  basemap: getBasemap,
  labels: getLabel,
});
