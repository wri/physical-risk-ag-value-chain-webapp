import { HYDRATE } from 'next-redux-wrapper';
import isEmpty from 'lodash/isEmpty';

// Services
import { fetchDataset } from 'services/dataset';
import RasterService from 'services/raster';
import { fetchLayer } from 'services/layer';
import {
  deleteFavourite,
  createFavourite,
  fetchFavorites,
} from 'services/favourites';
import { fetchWidget } from 'services/widget';

/**
 * CONSTANTS
 */
const SET_WIDGET_SUCCESS = 'SET_WIDGET_SUCCESS';
const GET_WIDGET_ERROR = 'GET_WIDGET_ERROR';
const SET_WIDGET_LOADING = 'SET_WIDGET_LOADING';
const SET_WIDGET_DATA = 'SET_WIDGET_DATA';
const SET_WIDGET_DATASET = 'SET_WIDGET_DATASET';
const SET_WIDGET_BAND_DESCRIPTION = 'SET_WIDGET_BAND_DESCRIPTION';
const SET_WIDGET_BAND_STATS = 'SET_WIDGET_BAND_STATS';
const SET_WIDGET_LAYERGROUPS = 'SET_WIDGET_LAYERGROUPS';
const SET_WIDGET_ZOOM = 'SET_WIDGET_ZOOM';
const SET_WIDGET_LATLNG = 'SET_WIDGET_LATLNG';
const GET_WIDGET_FAVORITE = 'GET_WIDGET_FAVORITE';

/**
 * STORE
 */
const initialState = {
  data: {}, // Actual widget
  dataset: {}, // Dataset associated with the widget
  bandDescription: null, // Description of the band if a raster widget
  bandStats: {}, // Stats about the band if a raster widget
  layerGroups: [], // LayerGroups for the map widgets
  zoom: 3,
  latLng: { lat: 0, lng: 0 },
  loading: true, // Are we loading the data?
  error: null, // An error was produced while loading the data
  favourite: {
    id: null,
    favourited: false,
  },
};

/**
 * REDUCER
 */
export default function Widget(state = initialState, action) {
  switch (action.type) {
    case HYDRATE: {
      return {
        ...state,
        ...action.payload.widget,
      };
    }
    case SET_WIDGET_LOADING: {
      const widget = {
        loading: true,
        error: null,
      };
      return { ...state, ...widget };
    }

    case SET_WIDGET_SUCCESS: {
      const widget = {
        loading: false,
        error: null,
      };
      return { ...state, ...widget };
    }

    case GET_WIDGET_ERROR: {
      const widget = {
        loading: false,
        error: action.payload,
      };
      return { ...state, ...widget };
    }

    case SET_WIDGET_DATA: {
      const widget = { data: action.payload };
      return { ...state, ...widget };
    }

    case SET_WIDGET_DATASET: {
      const widget = { dataset: action.payload };
      return { ...state, ...widget };
    }

    case SET_WIDGET_BAND_DESCRIPTION: {
      const widget = { bandDescription: action.payload };
      return { ...state, ...widget };
    }

    case SET_WIDGET_BAND_STATS: {
      const widget = { bandStats: action.payload };
      return { ...state, ...widget };
    }

    case SET_WIDGET_LAYERGROUPS: {
      const widget = { layerGroups: action.payload };
      return { ...state, ...widget };
    }

    case SET_WIDGET_ZOOM: {
      return { ...state, zoom: action.payload };
    }

    case SET_WIDGET_LATLNG: {
      return { ...state, latLng: action.payload };
    }

    case GET_WIDGET_FAVORITE: {
      return {
        ...state,
        favourite: { ...state.favourite, ...action.payload },
      };
    }

    default:
      return state;
  }
}

/**
 * ACTIONS
 */

/**
 * Fetch the dataset and set the dataset attribute
 * of the state
 * NOTE: returns when the state is updated
 * @param {string} datasetId
 * @returns {Promise<void>}
 */
const getDataset = (datasetId) => (dispatch) =>
  fetchDataset(datasetId, { includes: 'metadata' }).then((dataset) =>
    dispatch({ type: SET_WIDGET_DATASET, payload: dataset })
  );

/**
 * Get the information of band of a raster dataset
 * @param {string} datasetId Dataset ID
 * @param {string} bandName Name of the band
 */
function fetchRasterBandInfo(datasetId, bandName) {
  // eslint-disable-next-line no-async-promise-executor
  return (dispatch, getState) =>
    new Promise(async (resolve) => {
      try {
        if (isEmpty(getState().widget.dataset)) {
          await dispatch(getDataset(datasetId));
        }

        const dataset = getState().widget.dataset.attributes;

        // We don't need the "else" for the following conditions
        // because the band information is not vital and also because
        // it's not mandatory
        let { metadata } = dataset;
        if (metadata && metadata.length) {
          metadata = metadata[0].attributes;
          const { columns } = metadata;

          if (columns[bandName] && columns[bandName].description) {
            dispatch({
              type: SET_WIDGET_BAND_DESCRIPTION,
              payload: columns[bandName].description,
            });
          }
        }

        const { provider, tableName } = dataset;
        const rasterService = new RasterService(datasetId, tableName, provider);
        const bandStats = await rasterService.getBandStatsInfo(bandName);
        dispatch({ type: SET_WIDGET_BAND_STATS, payload: bandStats });
        dispatch({ type: SET_WIDGET_SUCCESS });
        resolve();
      } catch (err) {
        // We can't use Toastr here because an embed doesn't display a notification

        // Even if we failed to load some data, we still resolve because we can still
        // display the graph (only the additional info will be missing)
        resolve();
      }
    });
}
/**
 * Get the layer of a map widget
 * @param {string} datasetId Dataset ID
 * @param {string} layerId Layer ID
 */
function getLayer(datasetId, layerId) {
  return (dispatch) =>
    fetchLayer(layerId).then((layer) => {
      const layerGroups = [
        {
          dataset: datasetId,
          visible: true,
          layers: [
            {
              active: true,
              ...layer,
            },
          ],
        },
      ];
      dispatch({ type: SET_WIDGET_LAYERGROUPS, payload: layerGroups });
      dispatch({ type: SET_WIDGET_SUCCESS });
    });
}

export function setZoom(zoom) {
  return (dispatch) => dispatch({ type: SET_WIDGET_ZOOM, payload: zoom });
}

export function setLatLng(latLng) {
  return (dispatch) => dispatch({ type: SET_WIDGET_LATLNG, payload: latLng });
}

/**
 * Fetchs a widget
 * @param {string} widgetId
 * @param {object} params
 */
export function getWidget(widgetId, params = {}) {
  return (dispatch) => {
    dispatch({ type: SET_WIDGET_LOADING });
    return fetchWidget(widgetId, params)
      .then((widget) => {
        dispatch({ type: SET_WIDGET_DATA, payload: widget });
        const { widgetConfig } = widget;
        const isRaster =
          widgetConfig.paramsConfig &&
          widgetConfig.paramsConfig.visualizationType === 'raster_chart';
        const isMap =
          widgetConfig.paramsConfig &&
          widgetConfig.paramsConfig.visualizationType === 'map';
        const datasetId = widget.dataset;
        if (isRaster) {
          const bandName = widgetConfig.paramsConfig.band.name;
          return dispatch(fetchRasterBandInfo(datasetId, bandName));
        }

        if (isMap) {
          const layerId =
            widgetConfig.paramsConfig && widgetConfig.paramsConfig.layer;
          const { zoom } = widgetConfig;
          const latLng = widgetConfig.lat &&
            widgetConfig.lng && {
              lat: widgetConfig.lat,
              lng: widgetConfig.lng,
            };

          if (zoom) dispatch(setZoom(zoom));
          if (latLng) dispatch(setLatLng(latLng));

          return dispatch(getLayer(datasetId, layerId));
        }

        dispatch({ type: SET_WIDGET_SUCCESS });

        return widget;
      })
      .catch((err) => {
        dispatch({ type: GET_WIDGET_ERROR, payload: err.message });
      });
  };
}

/**
 * Event handler executed when the user toggles the
 * visibility of a layer group
 * @param {LayerGroup} layerGroup - Layer group to toggle
 */
export function toggleLayerGroupVisibility(layerGroup) {
  return (dispatch, getState) => {
    const layerGroups = getState().widget.layerGroups.map((l) => {
      if (l.dataset !== layerGroup.dataset) return l;
      return { ...l, visible: !layerGroup.visible };
    });

    dispatch({ type: SET_WIDGET_LAYERGROUPS, payload: [...layerGroups] });
  };
}

/**
 * Set the favourited attribute of the store
 * @export
 * @param {string} widgetId  Widget ID
 * @param {{ id: string, token: string }?} user  Widget ID
 */

export function checkIfFavorited(widgetId) {
  return (dispatch, getState) => {
    const { user } = getState();

    if (!user.id) {
      dispatch({
        type: GET_WIDGET_FAVORITE,
        payload: { id: null, favourited: false },
      });
    } else {
      fetchFavorites(user.token).then((res) => {
        const favourite =
          res.find &&
          res.find((elem) => elem.attributes.resourceId === widgetId);

        dispatch({
          type: GET_WIDGET_FAVORITE,
          payload: {
            id: favourite ? favourite.id : null,
            favourited: !!favourite,
          },
        });
      });
    }
  };
}

/**
 * Set if the wiget is favourited or not
 * @export
 * @param {string} widgetId Widget ID
 * @param {boolean} toFavorite Whether to make it favourite or not
 */
export function setIfFavorited(widgetId, toFavorite) {
  return (dispatch, getState) => {
    const { user, widget } = getState();

    // If the user is not logged in, we just return
    if (!user.id) return;

    // We have an optimistic approach: we tell the user the action
    // is already done, and if it fails, we rever it
    dispatch({
      type: GET_WIDGET_FAVORITE,
      payload: { favourited: toFavorite },
    });

    if (toFavorite) {
      createFavourite(user.token, {
        resourceType: 'widget',
        resourceId: widgetId,
      })
        .then((res) =>
          dispatch({ type: GET_WIDGET_FAVORITE, payload: { id: res.data.id } })
        )
        .catch(() =>
          dispatch({ type: GET_WIDGET_FAVORITE, payload: { id: null } })
        );
    } else {
      const {
        favourite: { id },
      } = widget;

      deleteFavourite(id, user.token)
        .then(() =>
          dispatch({ type: GET_WIDGET_FAVORITE, payload: { id: null } })
        )
        .catch(() => dispatch({ type: GET_WIDGET_FAVORITE, payload: { id } }));
    }
  };
}
