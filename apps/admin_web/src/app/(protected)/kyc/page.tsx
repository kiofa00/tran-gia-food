'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileImageOutlined,
  IdcardOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Image,
  Modal,
  Row,
  Space,
  Statistic,
  Tag,
  Tooltip,
  Typography,
} from 'antd';

import { DataTable, PageContainer, PageHeader, SearchFilterBox } from '@/components';
import { useLocale } from '@/hooks';
import { apiClient } from '@/services/apiClient';

const { Text, Title } = Typography;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface KycRecord {
  key: string;
  id: string;
  name: string;
  phone: string;
  cccd: string;
  vehicleType: string;
  submittedAt: string;
  status: KycStatus;
  cccdFrontUrl?: string;
  cccdBackUrl?: string;
  driverLicenseUrl?: string;
  vehicleRegUrl?: string;
  selfieUrl?: string;
  rejectReason?: string;
}

// ---------------------------------------------------------------------------
// Query Keys & API fetcher
// ---------------------------------------------------------------------------

const KYC_QUERY_KEYS = {
  all: ['admin', 'kyc'] as const,
  list: (params?: { search?: string; status?: string }) =>
    [...KYC_QUERY_KEYS.all, 'list', params] as const,
};

async function fetchKycApplications(params?: {
  search?: string;
  status?: string;
}): Promise<KycRecord[]> {
  try {
    const res = await apiClient.get<unknown>('/admin/kyc/shippers', {
      params,
    });
    const data = res.data;
    let raw: Record<string, unknown>[] = [];

    if (Array.isArray(data)) {
      raw = data as Record<string, unknown>[];
    } else if (
      data !== null &&
      typeof data === 'object' &&
      Array.isArray((data as { data?: unknown }).data)
    ) {
      raw = (data as { data: Record<string, unknown>[] }).data;
    }

    return raw.map((item, idx) => {
      const user = (item.user as Record<string, unknown>) || {};
      const statusRaw = String(
        item.ekycStatus ?? item.kycStatus ?? item.status ?? 'PENDING',
      ).toUpperCase();
      const normalizedStatus: KycRecord['status'] =
        statusRaw === 'VERIFIED' ? 'APPROVED' : (statusRaw as KycRecord['status']);

      return {
        key: String(item.id ?? idx),
        id: String(item.id ?? idx),
        name: String(user.name ?? item.name ?? item.fullName ?? 'Chưa cập nhật'),
        phone: String(user.phone ?? item.phone ?? ''),
        cccd: String(item.cccd ?? item.cccdNumber ?? ''),
        vehicleType: String(item.vehicleType ?? 'motorbike'),
        submittedAt: String(item.submittedAt ?? item.createdAt ?? ''),
        status: normalizedStatus || 'PENDING',
        cccdFrontUrl: item.cccdFrontUrl as string | undefined,
        cccdBackUrl: item.cccdBackUrl as string | undefined,
        driverLicenseUrl: item.driverLicenseUrl as string | undefined,
        vehicleRegUrl: item.vehicleRegUrl as string | undefined,
        selfieUrl: item.selfieUrl as string | undefined,
        rejectReason: item.rejectReason as string | undefined,
      };
    });
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function KycReviewPage() {
  const { message } = App.useApp();
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

  const statusFilterOptions = useMemo(
    () => [
      { label: t('kyc.all', 'Tất cả'), value: 'ALL' },
      { label: t('kyc.tabPending', 'Chờ duyệt'), value: 'PENDING' },
      { label: t('kyc.tabVerified', 'Đã duyệt'), value: 'APPROVED' },
      { label: t('kyc.tabRejected', 'Từ chối'), value: 'REJECTED' },
    ],
    [t],
  );

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
    }),
    [search, statusFilter],
  );

  const { data: records = [], isLoading } = useQuery({
    queryKey: KYC_QUERY_KEYS.list(queryParams),
    queryFn: () => fetchKycApplications(queryParams),
    refetchInterval: 30000,
  });

  const pending = records.filter((r) => r.status === 'PENDING').length;
  const approved = records.filter((r) => r.status === 'APPROVED').length;
  const rejected = records.filter((r) => r.status === 'REJECTED').length;

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/admin/shippers/${id}/kyc`, { status: 'VERIFIED' });
    },
    onSuccess: () => {
      message.success(t('kyc.approveSuccess', '✅ Đã duyệt hồ sơ KYC!'));
      queryClient.invalidateQueries({ queryKey: KYC_QUERY_KEYS.all });
      setDrawerOpen(false);
    },
    onError: () => message.error(t('kyc.errorOccurred', 'Có lỗi xảy ra, thử lại!')),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await apiClient.patch(`/admin/shippers/${id}/kyc`, {
        status: 'REJECTED',
        rejectReason: reason,
      });
    },
    onSuccess: () => {
      message.success(t('kyc.rejectSuccess', 'Đã từ chối hồ sơ!'));
      queryClient.invalidateQueries({ queryKey: KYC_QUERY_KEYS.all });
      setDrawerOpen(false);
      setShowRejectInput(false);
      setRejectReason('');
    },
    onError: () => message.error(t('kyc.errorOccurred', 'Có lỗi xảy ra!')),
  });

  const openDrawer = useCallback((record: KycRecord) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
    setShowRejectInput(false);
    setRejectReason('');
  }, []);

  const handleApprove = () => {
    if (!selectedRecord) return;
    Modal.confirm({
      title: t('kyc.approveConfirmTitle', 'Xác nhận duyệt hồ sơ KYC?'),
      content: t(
        'kyc.approveConfirmContent',
        `Tài khoản shipper "${selectedRecord.name}" sẽ được kích hoạt.`,
        { name: selectedRecord.name },
      ),
      okText: t('kyc.approveNow', 'Duyệt ngay'),
      cancelText: t('common.cancel', 'Hủy'),
      okButtonProps: { style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } },
      onOk: () => approveMutation.mutate(selectedRecord.id),
    });
  };

  const handleReject = () => {
    if (!selectedRecord) return;
    if (!rejectReason.trim()) {
      message.warning(t('kyc.rejectReasonRequired', 'Vui lòng nhập lý do từ chối!'));

      return;
    }
    rejectMutation.mutate({ id: selectedRecord.id, reason: rejectReason.trim() });
  };

  const columns = useMemo(
    () => [
      {
        title: t('kyc.driver', 'Tài xế'),
        dataIndex: 'name',
        key: 'name',
        render: (name: string, rec: KycRecord) => (
          <Space>
            <Avatar icon={<UserOutlined />} className="bg-orange-500" />
            <div>
              <Text strong className="block">
                {name}
              </Text>
              <Text type="secondary" className="text-xs">
                {rec.phone}
              </Text>
            </div>
          </Space>
        ),
      },
      {
        title: t('kyc.cccd', 'Số CCCD'),
        dataIndex: 'cccd',
        key: 'cccd',
        render: (cccd: string) => <Text code>{cccd || 'N/A'}</Text>,
      },
      {
        title: t('kyc.vehicle', 'Phương tiện'),
        dataIndex: 'vehicleType',
        key: 'vehicleType',
        render: (v: string) => getVehicleLabel(v),
      },
      {
        title: t('kyc.submittedAt', 'Ngày nộp'),
        dataIndex: 'submittedAt',
        key: 'submittedAt',
        render: (dt: string) => <Text className="text-xs text-gray-500">{dt}</Text>,
      },
      {
        title: t('kyc.status', 'Trạng thái'),
        dataIndex: 'status',
        key: 'status',
        render: (s: KycStatus) => <KycStatusBadge status={s} />,
      },
      {
        title: t('kyc.actions', 'Hành động'),
        key: 'action',
        render: (_: unknown, rec: KycRecord) => (
          <Button
            icon={<EyeOutlined />}
            onClick={() => openDrawer(rec)}
            disabled={rec.status !== 'PENDING'}
          >
            {rec.status === 'PENDING' ? t('kyc.review', 'Xem xét') : t('kyc.processed', 'Đã xử lý')}
          </Button>
        ),
      },
    ],
    [getVehicleLabel, openDrawer, t],
  );

  const filteredRecords = useMemo(() => {
    const q = search.toLowerCase();

    return records.filter((r) => {
      const matchSearch =
        !q || r.name.toLowerCase().includes(q) || r.phone.includes(q) || r.cccd.includes(q);
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [records, search, statusFilter]);

  return (
    <PageContainer>
      <PageHeader
        icon="🪪"
        title={t('kyc.title', 'Duyệt Hồ Sơ KYC Shipper')}
        subtitle={t(
          'kyc.subtitle',
          'Xem xét và phê duyệt hồ sơ xác minh danh tính của các shipper đăng ký mới',
        )}
      />

      {/* Stats row */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card variant="borderless" className="rounded-xl shadow-sm">
            <Statistic
              title={`⏳ ${t('kyc.tabPending', 'Chờ duyệt')}`}
              value={pending}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" className="rounded-xl shadow-sm">
            <Statistic
              title={`✅ ${t('kyc.tabVerified', 'Đã duyệt')}`}
              value={approved}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" className="rounded-xl shadow-sm">
            <Statistic
              title={`❌ ${t('kyc.tabRejected', 'Từ chối')}`}
              value={rejected}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

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
            filterOptions={statusFilterOptions}
          />
          <div className="flex justify-end">
            <Tooltip title={t('kyc.refreshTooltip', 'Làm mới danh sách')}>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => queryClient.invalidateQueries({ queryKey: KYC_QUERY_KEYS.all })}
              >
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
      <Drawer
        title={
          <Space>
            <IdcardOutlined />
            <span>
              {t('kyc.detailTitle', 'Hồ Sơ KYC')} — {selectedRecord?.name}
            </span>
            {selectedRecord && <KycStatusBadge status={selectedRecord.status} />}
          </Space>
        }
        width={640}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        footer={
          selectedRecord?.status === 'PENDING' ? (
            <Space className="w-full justify-end" wrap>
              {showRejectInput ? (
                <>
                  <textarea
                    className="border rounded px-3 py-2 w-64 text-sm resize-none"
                    rows={2}
                    placeholder={t('kyc.rejectPlaceholder', 'Nhập lý do từ chối...')}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <Button
                    danger
                    onClick={handleReject}
                    loading={rejectMutation.isPending}
                    icon={<CloseCircleOutlined />}
                  >
                    {t('kyc.confirmReject', 'Xác nhận từ chối')}
                  </Button>
                  <Button onClick={() => setShowRejectInput(false)}>
                    {t('common.cancel', 'Hủy')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    danger
                    onClick={() => setShowRejectInput(true)}
                    icon={<CloseCircleOutlined />}
                  >
                    {t('kyc.rejectBtn', 'Từ chối')}
                  </Button>
                  <Button
                    type="primary"
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    onClick={handleApprove}
                    loading={approveMutation.isPending}
                    icon={<CheckCircleOutlined />}
                  >
                    {t('kyc.approveBtn', 'Duyệt KYC')}
                  </Button>
                </>
              )}
            </Space>
          ) : null
        }
      >
        {selectedRecord && (
          <Space direction="vertical" className="w-full" size="large">
            {/* Personal info */}
            <Descriptions
              title={t('kyc.personalInfoTitle', 'Thông tin cá nhân')}
              bordered
              size="small"
              column={1}
            >
              <Descriptions.Item label={t('users.fullName', 'Họ và tên')}>
                <Text strong>{selectedRecord.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('kyc.phone', 'Số điện thoại')}>
                {selectedRecord.phone}
              </Descriptions.Item>
              <Descriptions.Item label={t('kyc.cccd', 'Số CCCD')}>
                <Text code>{selectedRecord.cccd}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('kyc.vehicle', 'Phương tiện')}>
                {getVehicleLabel(selectedRecord.vehicleType)}
              </Descriptions.Item>
              <Descriptions.Item label={t('kyc.submittedDate', 'Ngày nộp hồ sơ')}>
                {selectedRecord.submittedAt}
              </Descriptions.Item>
              {selectedRecord.rejectReason && (
                <Descriptions.Item label={t('kyc.rejectReasonLabel', 'Lý do từ chối')}>
                  <Text type="danger">{selectedRecord.rejectReason}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Document images */}
            <div>
              <Title level={5} className="mb-3">
                <FileImageOutlined className="mr-2" />
                {t('kyc.documentsTitle', 'Ảnh giấy tờ')}
              </Title>
              <Row gutter={[12, 12]}>
                {[
                  {
                    label: t('kyc.cccdFront', 'CCCD mặt trước'),
                    url: selectedRecord.cccdFrontUrl,
                  },
                  {
                    label: t('kyc.cccdBack', 'CCCD mặt sau'),
                    url: selectedRecord.cccdBackUrl,
                  },
                  {
                    label: t('kyc.driverLicense', 'Bằng lái xe'),
                    url: selectedRecord.driverLicenseUrl,
                  },
                  {
                    label: t('kyc.vehicleReg', 'Đăng ký xe'),
                    url: selectedRecord.vehicleRegUrl,
                  },
                ].map((doc) => (
                  <Col span={12} key={doc.label}>
                    <div className="border rounded-lg overflow-hidden">
                      {doc.url ? (
                        <Image
                          src={doc.url}
                          alt={doc.label}
                          className="w-full object-cover"
                          style={{ height: 140 }}
                        />
                      ) : (
                        <div
                          className="flex flex-col items-center justify-center bg-gray-50 text-gray-400"
                          style={{ height: 140 }}
                        >
                          <FileImageOutlined style={{ fontSize: 32 }} />
                          <div className="text-xs mt-2">{t('kyc.noImage', 'Chưa có ảnh')}</div>
                        </div>
                      )}
                      <div className="text-xs text-center py-2 text-gray-500 bg-gray-50 border-t">
                        {doc.label}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Selfie */}
            <div>
              <Title level={5} className="mb-3">
                <UserOutlined className="mr-2" />
                {t('kyc.selfie', 'Ảnh selfie xác minh')}
              </Title>
              {selectedRecord.selfieUrl ? (
                <Image
                  src={selectedRecord.selfieUrl}
                  alt="Selfie"
                  style={{ width: 200, height: 200, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="flex flex-col items-center justify-center bg-gray-50 border border-dashed rounded-full text-gray-400"
                  style={{ width: 160, height: 160 }}
                >
                  <UserOutlined style={{ fontSize: 40 }} />
                  <div className="text-xs mt-2">{t('kyc.noSelfie', 'Chưa có selfie')}</div>
                </div>
              )}
            </div>
          </Space>
        )}
      </Drawer>
    </PageContainer>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KycStatusBadge({ status }: { status: KycStatus }) {
  const { t } = useLocale();
  const configMap: Record<KycStatus, { color: string; label: string }> = {
    PENDING: { color: 'orange', label: `⏳ ${t('kyc.tabPending', 'Chờ duyệt')}` },
    APPROVED: { color: 'green', label: `✅ ${t('kyc.tabVerified', 'Đã duyệt')}` },
    REJECTED: { color: 'red', label: `❌ ${t('kyc.tabRejected', 'Từ chối')}` },
  };
  const config = configMap[status] ?? configMap.PENDING;

  return <Tag color={config.color}>{config.label}</Tag>;
}
