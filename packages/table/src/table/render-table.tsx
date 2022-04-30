/*
 * @Author: 焦质晔
 * @Date: 2020-02-29 22:17:28
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-04-30 12:41:27
 */
import { getPrefixCls } from '../../../_utils/prefix';
import { EAlign } from './types';
import type { JSXNode } from '../../../_utils/types';

import TableHeader from '../header';
import TableBody from '../body';
import TableFooter from '../footer';
import Pager from '../pager';
import Spin from '../../../spin';
import EmptyContent from '../empty';
import Alert from '../alert';
import ColumnFilter from '../column-filter';
import SelectCollection from '../select-collection';
import GroupSummary from '../group-summary';
import HighSearch from '../high-search';
import FastSearch from '../fast-search';
import FullScreen from '../full-screen';
import TableImport from '../import';
import TableExport from '../export';
import PrintTable from '../print';
import Reload from '../reload';

const prefixCls = getPrefixCls('table');

export default {
  renderBorderLine(): JSXNode {
    return this.bordered && <div class={`${prefixCls}--border-line`} />;
  },
  renderResizableLine(): JSXNode {
    return this.resizable && <div ref="resizable-bar" class={`${prefixCls}--resizable-bar`} />;
  },
  renderTable(): JSXNode {
    const {
      isFullScreen,
      tableData,
      columns,
      tableColumns,
      flattenColumns,
      tableSize,
      loading,
      showLoading,
      bordered,
      stripe,
      customClass,
      tableStyles,
      showHeader,
      showFooter,
      showPagination,
      isHeadSorter,
      isHeadFilter,
      isTableEmpty,
      scrollX,
      scrollY,
      isFetch,
      isPingLeft,
      isPingRight,
      leftFixedColumns,
      rightFixedColumns,
      pagination,
      permission,
      total,
      selectionKeys,
      showAlert,
      topSpaceAlign,
      showFullScreen,
      showRefresh,
      tablePrint,
      exportExcel,
      isSelectCollection,
      isSuperSearch,
      isFastSearch,
      isTableImport,
      isGroupSummary,
      showColumnDefine,
    } = this;

    const wrapperCls = {
      [`${prefixCls}--wrapper`]: true,
      [`${prefixCls}--maximize`]: isFullScreen,
      [`${prefixCls}--large`]: tableSize === 'large',
      [`${prefixCls}--default`]: tableSize === 'default',
      [`${prefixCls}--small`]: tableSize === 'small',
      [customClass]: !!customClass,
    };
    const tableCls = {
      [prefixCls]: true,
      [`is--border`]: bordered,
      [`is--striped`]: stripe,
      [`is--fixed`]: leftFixedColumns.length || rightFixedColumns.length,
      [`is--sortable`]: isHeadSorter,
      [`is--filterable`]: isHeadFilter,
      [`is--empty`]: isTableEmpty,
      [`show--head`]: showHeader,
      [`show--foot`]: showFooter,
      [`ping--left`]: isPingLeft,
      [`ping--right`]: isPingRight,
      [`scroll--x`]: scrollX,
      [`scroll--y`]: scrollY,
    };
    const tableHeaderProps = {
      ref: 'tableHeader',
      tableColumns,
      flattenColumns,
    };
    const tableBodyProps = {
      ref: 'tableBody',
      tableData,
      flattenColumns,
    };
    const tableFooterProps = {
      ref: 'tableFooter',
      flattenColumns,
    };
    const printProps = tablePrint
      ? {
          tableColumns,
          flattenColumns,
        }
      : null;
    const exportProps = exportExcel
      ? {
          tableColumns,
          flattenColumns,
        }
      : null;
    const pagerProps = {
      ...Object.assign({}, this.getPaginationConfig(), {
        size: tableSize,
        total,
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
      }),
      onCurrentChange: this.pagerChangeHandle,
      onSizeChange: this.pagerChangeHandle,
    };

    return (
      <div class={wrapperCls}>
        <div ref="toper" class={`${prefixCls}-top`}>
          <div class={`${prefixCls}-top__space`}>
            {/* 顶部信息 */}
            {showAlert && <Alert total={total} selectionKeys={selectionKeys} />}
            <div class={`${prefixCls}-top__space-slot`} style={{ justifyContent: EAlign[topSpaceAlign] }}>
              {/* 默认槽口 */}
              {this.$slots.default?.()}
            </div>
          </div>
          <div class={`${prefixCls}-top__actions`}>
            {/* 全屏 */}
            {showFullScreen && <FullScreen />}
            {/* 刷新 */}
            {showRefresh && isFetch && <Reload />}
            {/* 打印 */}
            {permission.print && tablePrint && <PrintTable {...printProps} />}
            {/* 导入 */}
            {isTableImport && <TableImport columns={tableColumns} />}
            {/* 导出 */}
            {permission.export && exportExcel && <TableExport {...exportProps} />}
            {/* 多选集合 */}
            {isSelectCollection && <SelectCollection columns={tableColumns} />}
            {/* 快速定位查找 */}
            {isFastSearch && <FastSearch />}
            {/* 高级检索 */}
            {isSuperSearch && <HighSearch columns={flattenColumns} />}
            {/* 分组汇总 */}
            {isGroupSummary && <GroupSummary columns={flattenColumns} />}
            {/* 列定义 */}
            {showColumnDefine && <ColumnFilter columns={columns} />}
          </div>
        </div>
        <Spin spinning={loading ?? showLoading} tip="Loading...">
          <div ref="table" class={tableCls} style={tableStyles}>
            {/* 主要内容 */}
            <div class={`${prefixCls}--main-wrapper`}>
              {/* 头部 */}
              {showHeader && <TableHeader {...tableHeaderProps} />}
              {/* 表格体 */}
              <TableBody {...tableBodyProps} />
              {/* 底部 */}
              {showFooter && <TableFooter {...tableFooterProps} />}
            </div>
            {/* 边框线 */}
            {this.renderBorderLine()}
            {/* 空数据 */}
            {isTableEmpty && <EmptyContent />}
            {/* 列宽线 */}
            {this.renderResizableLine()}
          </div>
        </Spin>
        {/* 分页 */}
        {showPagination && <Pager {...pagerProps} />}
      </div>
    );
  },
};
