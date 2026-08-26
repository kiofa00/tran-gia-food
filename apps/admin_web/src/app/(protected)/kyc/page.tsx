'use client';

import { useCallback, useMemo, useState } from 'react';

import { ReloadOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { App, Button, Card, Space, Tooltip } from 'antd';

import {
  DataTable,
  KycRecord,
  KycReviewDrawer,
  KycStatsRow,
  PageContainer,
  PageHeader,
  SearchFilterBox,
  mapKycItemToRecord,
  useApproveKycMutation,
  useKycColumns,
  useKycQuery,
  useRejectKycMutation,
} from '@/components';
import { useLocale } from '@/hooks';
import { KYC_QUERY_KEYS, KYC_STATUS_FILTER_OPTIONS } from '@/shared-config';

export default function KycReviewPage() {
  const { message, modal } = App.useApp();
  const { t } = useLocale();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState<KycRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const getVehicleLabel = useCallback(
    (type: string) => {
      const labels: Record<string, string> = {
        motorbike: t('vehicles.motorbike', 'Xe máy'),
        car: t('vehicles.car', 'Ô tô'),
        truck: t('vehicles.truck', 'Xe tải'),
        bicycle: t('vehicles.bicycle', 'Xe đạp'),
      };

      return labels[type] || type;
    },
    [t],
  );

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
    }),
    [search, statusFilter],
  );

  const { data: rawData = [], isLoading } = useKycQuery(queryParams);

  const records: KycRecord[] = useMemo(
    () => rawData.map((item, idx) => mapKycItemToRecord(item, idx)),
    [rawData],
  );

  const pending = records.filter((r) => r.status === 'PENDING').length;
  const approved = records.filter((r) => r.status === 'APPROVED').length;
  const rejected = records.filter((r) => r.status === 'REJECTED').length;

  const approveMutation = useApproveKycMutation();
  const rejectMutation = useRejectKycMutation();

  const openDrawer = useCallback((record: KycRecord) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
    setShowRejectInput(false);
    setRejectReason('');
  }, []);

  const handleApprove = () => {
    if (!selectedRecord) return;
    modal.confirm({
      title: t('kyc.approveConfirmTitle', 'Xác nhận duyệt hồ sơ KYC?'),
      content: t(
        'kyc.approveConfirmContent',
        `Tài khoản shipper "${selectedRecord.name}" sẽ được kích hoạt.`,
        { name: selectedRecord.name },
      ),
      okText: t('kyc.approveNow', 'Duyệt ngay'),
      cancelText: t('common.cancel', 'Hủy'),
      okButtonProps: { style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } },
      onOk: async () => {
        try {
          await approveMutation.mutateAsync(selectedRecord.id);
          message.success(t('kyc.approveSuccess', '✅ Đã duyệt hồ sơ KYC!'));
          setDrawerOpen(false);
        } catch {
          message.error(t('kyc.errorOccurred', 'Có lỗi xảy ra, thử lại!'));
        }
      },
    });
  };

  const handleReject = async () => {
    if (!selectedRecord) return;
    if (!rejectReason.trim()) {
      message.warning(t('kyc.rejectReasonRequired', 'Vui lòng nhập lý do từ chối!'));

      return;
    }
    try {
      await rejectMutation.mutateAsync({
        id: selectedRecord.id,
        reason: rejectReason.trim(),
      });
      message.success(t('kyc.rejectSuccess', 'Đã từ chối hồ sơ!'));
      setDrawerOpen(false);
      setShowRejectInput(false);
      setRejectReason('');
    } catch {
      message.error(t('kyc.errorOccurred', 'Có lỗi xảy ra!'));
    }
  };

  const columns = useKycColumns({
    onOpenDrawer: openDrawer,
    getVehicleLabel,
  });

  const filteredRecords = useMemo(() => {
    const q = search.toLowerCase();

    return records.filter((r) => {
      const matchSearch =
        !q || r.name.toLowerCase().includes(q) || r.phone.includes(q) || r.cccd.includes(q);
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [records, search, statusFilter]);

  const currentSelectedRecord = useMemo(() => {
    if (!selectedRecord) return null;

    return records.find((r) => r.id === selectedRecord.id) || selectedRecord;
  }, [records, selectedRecord]);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: KYC_QUERY_KEYS.all });
    message.success(t('dashboard.refreshedSuccess', 'Đã cập nhật số liệu mới nhất!'));
  };

  return (
    <PageContainer>
      <PageHeader
        icon="🪪"
        title={t('kyc.title', 'Duyệt Hồ Sơ KYC Shipper')}
        subtitle={t(
          'kyc.subtitle',
          'Xem xét và phê duyệt hồ sơ xác minh danh tính của các shipper đăng ký mới',
        )}
        action={
          <Button
            type="primary"
            ghost
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={isLoading}
            className="font-semibold"
          >
            {t('dashboard.refreshBtn', 'Làm mới số liệu')}
          </Button>
        }
      />

      {/* Stats row */}
      <KycStatsRow pending={pending} approved={approved} rejected={rejected} />

      {/* Table */}
      <Card variant="borderless" className="rounded-xl shadow-sm">
        <Space direction="vertical" className="w-full" size="middle">
          <SearchFilterBox
            searchPlaceholder={t('kyc.searchPlaceholder', 'Tìm theo tên, SĐT, số CCCD...')}
            searchValue={search}
            onSearchChange={(v) => setSearch(v)}
            filterLabel={t('common.status', 'Trạng thái:')}
            filterValue={statusFilter}
            onFilterChange={(v) => setStatusFilter(v)}
            filterOptions={KYC_STATUS_FILTER_OPTIONS}
          />
          <div className="flex justify-end">
            <Tooltip title={t('kyc.refreshTooltip', 'Làm mới danh sách')}>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={isLoading}>
                {t('dashboard.refreshBtn', 'Làm mới')}
              </Button>
            </Tooltip>
          </div>
          <DataTable<KycRecord>
            rowKey="key"
            columns={columns}
            dataSource={filteredRecords}
            loading={isLoading}
            scroll={{ x: 900 }}
            emptyDescription={t('kyc.emptyDescription', 'Không có hồ sơ nào trong mục này')}
          />
        </Space>
      </Card>

      {/* Detail Drawer */}
      <KycReviewDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={currentSelectedRecord}
        getVehicleLabel={getVehicleLabel}
        onApprove={handleApprove}
        onReject={handleReject}
        isApproving={approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
        showRejectInput={showRejectInput}
        setShowRejectInput={setShowRejectInput}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
      />
    </PageContainer>
  );
}
