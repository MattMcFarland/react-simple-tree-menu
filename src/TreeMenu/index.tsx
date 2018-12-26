import * as React from 'react';
import { debounce } from 'lodash';

import walk, { TreeNode, Item } from './walk';
import {
  renderItem as defaultRenderItem,
  renderList as defaultRenderList,
  RenderItem,
  RenderList,
} from './renderProps';

type OnClickItemProps = {
  label: string | JSX.Element;
  key: string;
  [name: string]: any;
};

type TreeMenuProps = {
  data: { [name: string]: TreeNode };
  activeKey: string;
  onClickItem: (props: OnClickItemProps) => void;
  debounceTime: number;
  renderItem: RenderItem;
  renderList: RenderList;
};

type TreeMenuState = {
  openNodes: string[];
  searchTerm: string;
  activeKey: string;
};

const defaultOnClick = (props: OnClickItemProps) => console.log(props); // eslint-disable-line no-console

class TreeMenu extends React.Component<TreeMenuProps, TreeMenuState> {
  static defaultProps: TreeMenuProps = {
    data: {},
    activeKey: '',
    onClickItem: defaultOnClick,
    debounceTime: 125,
    renderItem: defaultRenderItem,
    renderList: defaultRenderList,
  };

  state: TreeMenuState = { openNodes: [], searchTerm: '', activeKey: '' };

  onSearch = (value: string) => {
    const { debounceTime } = this.props;
    const search = debounce(
      (searchTerm: string) => this.setState({ searchTerm }),
      debounceTime
    );
    search(value);
  };

  toggleNode = (node: string) => {
    const { openNodes } = this.state;
    if (openNodes.includes(node)) {
      this.setState({
        openNodes: openNodes.filter(openNode => openNode !== node),
      });
    } else {
      this.setState({ openNodes: [...openNodes, node] });
    }
  };

  getOnClickItem = (props: OnClickItemProps) => () => {
    const { onClickItem } = this.props;
    if (!this.props.activeKey) this.setState({ activeKey: props.key });
    this.toggleNode(props.key);
    onClickItem(props);
  };

  loadListItems = (): JSX.Element[] => {
    const { data, renderItem } = this.props;
    const { openNodes, searchTerm } = this.state;
    const activeKey = this.props.activeKey || this.state.activeKey;

    const items: Item[] = walk({ data, openNodes, searchTerm });

    return items.map(({ nodes, key, ...props }) => {
      const onClick = this.getOnClickItem({ key, ...props });

      return renderItem({
        hasSubItems: !!nodes,
        onClick,
        active: key === activeKey,
        key,
        ...props,
      });
    });
  };

  render() {
    const { data, renderList } = this.props;
    return (
      <>
        {renderList({
          search: this.onSearch,
          items: data ? this.loadListItems() : [],
        })}
      </>
    );
  }
}

export default TreeMenu;
