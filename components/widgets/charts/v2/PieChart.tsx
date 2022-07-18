import Renderer from '@widget-editor/renderer';
import RWAdapter from '@widget-editor/rw-adapter';
import { useMemo } from 'react';
import { chartData as widgetTemplate } from 'components/widgets/charts/v2/test-pie-chart';

const Pie = ({ widgetConfig }) => (
  <div
    className="relative flex overflow-y-hidden widget-container grow mb-3"
    style={{ height: 171 }}
  >
    <Renderer widgetConfig={widgetConfig} adapter={RWAdapter} />
  </div>
);

const PieChart = ({
  // format = 'deg',
  // unit = '%',
  type = 'of locations have extreme values',
  name = '2030 Projected Change in Annual Average Temperature',
  domain,
}) => {
  const values: { x: string; y: number }[] = useMemo(() => {
    const countMap = {};
    // Counting number of values
    domain.forEach((x: string) => {
      if (countMap[x]) countMap[x] = countMap[x] + 1;
      else countMap[x] = 1;
    });

    return Object.entries(countMap).map(([x, y]: [x: string, y: number]) => ({
      x,
      y,
    }));
  }, [domain]);

  // const extreme = useMemo(() => {

  // }, [])



  const widgetConfig = useMemo(
    () => ({
      ...widgetTemplate,
      data: [{ ...widgetTemplate.data[0], values }],
    }),
    [values]
  );

  const valueString = `${20}%`;

  return (
    <div className="c-pie-chart-v2">
      <Pie widgetConfig={widgetConfig} />
      {/* <h1 className="stat-value">{valueString}</h1>
      <h3 className="stat-type">{type}</h3> */}
      <div className="stat-name">{name}</div>
    </div>
  );
};

export default PieChart;
