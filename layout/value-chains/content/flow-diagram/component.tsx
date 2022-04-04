import { chain_items } from '../constants';
import classnames from 'classnames';
import FlowButton from 'layout/value-chains/content/flow-diagram/flow-button';
import StepItem from './step-item/component';

const FlowDiagram = ({ activeItem }) => {
  return (
    <div className="c-value-chain-flow">
      <div className="c-flow">
        {Object.entries(chain_items).map(([key, item], i) => (
          <div
            key={key}
            className={classnames({
              'c-chain-item': true,
              '-active': key === activeItem,
            })}
          >
            <FlowButton
              start={i === 0}
              end={i === chain_items.length - 1}
              label={item.label}
            />
            <ul className="c-item-list">
              {Object.entries(item.options).map(([key, o]) => (
                <li key={key}>
                  <StepItem id={key} {...o} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlowDiagram;
