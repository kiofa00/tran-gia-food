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
import { apiClient } from '@/services/apiClient';

const { Text, Title } = Typography;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface KycRecord {
  key: string;
  id: string;
  name: string;
  phone: string;
  cccd: string;
  vehicleType: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  cccdFrontUrl?: string;
  cccdBackUrl?: string;
  driverLicenseUrl?: string;
  vehicleRegUrl?: string;
  selfieUrl?: string;
  rejectReason?: string;
}

// ---------------------------------------------------------------------------
// Query Keys & Service
// ---------------------------------------------------------------------------

const KYC_QUERY_KEYS = {
  all: ['admin', 'kyc'],
  list: (params?: object) => [...KYC_QUERY_KEYS.all, 'list', params],
};

const KYC_STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: '⏳ Chờ duyệt' },
  { value: 'APPROVED', label: '✅ Đã duyệt' },
  { value: 'REJECTED', label: '❌ Từ chối' },
];

const VEHICLE_LABELS: Record<string, string> = {
  motorbike: '🛵 Xe máy',
  bicycle: '🚲 Xe đạp',
  car: '🚗 Ô tô',
};

async function fetchKycApplications(params?: {
  search?: string;
  status?: string;
}): Promise<KycRecord[]> {
  try {
    const res = await apiClient.get('/admin/shippers/kyc', { params });
    const raw: Record<string, unknown>[] = Array.isArray(res.data)
      ? res.data
      : ((res.data as { data?: Record<string, unknown>[] })?.data ?? []);

    return raw.map((item, idx) => ({
      key: String(item.id ?? idx),
      id: String(item.id ?? idx),
      name: String(item.name ?? item.fullName ?? 'N/A'),
      phone: String(item.phone ?? ''),
      cccd: String(item.cccd ?? item.cccdNumber ?? ''),
      vehicleType: String(item.vehicleType ?? 'motorbike'),
      submittedAt: String(item.submittedAt ?? item.createdAt ?? ''),
      status: (item.kycStatus as KycRecord['status']) ?? 'PENDING',
      cccdFrontUrl: item.cccdFrontUrl as string | undefined,
      cccdBackUrl: item.cccdBackUrl as string | undefined,
      driverLicenseUrl: item.driverLicenseUrl as string | undefined,
      vehicleRegUrl: item.vehicleRegUrl as string | undefined,
      selfieUrl: item.selfieUrl as string | undefined,
      rejectReason: item.rejectReason as string | undefined,
    }));
  } catch {
    // Fallback mock data for development
    return _mockKycData;
  }
}

const _mockKycData: KycRecord[] = [
  {
    key: '1',
    id: '1',
    name: 'Nguyễn Văn Tài',
    phone: '0901234567',
    cccd: '079201012345',
    vehicleType: 'motorbike',
    submittedAt: '2026-08-14 15:30',
    status: 'PENDING',
    cccdFrontUrl: undefined,
    cccdBackUrl: undefined,
    driverLicenseUrl: undefined,
    vehicleRegUrl: undefined,
    selfieUrl: undefined,
  },
  {
    key: '2',
    id: '2',
    name: 'Trần Thị Minh',
    phone: '0912345678',
    cccd: '079203098765',
    vehicleType: 'bicycle',
    submittedAt: '2026-08-14 10:12',
    status: 'PENDING',
  },
  {
    key: '3',
    id: '3',
    name: 'Lê Hoàng Nam',
    phone: '0987654321',
    cccd: '079199001234',
    vehicleType: 'motorbike',
    submittedAt: '2026-08-13 09:45',
    status: 'APPROVED',
  },
  {
    key: '4',
    id: '4',
    name: 'Phạm Quốc Bảo',
    phone: '0976543210',
    cccd: '079200055678',
    vehicleType: 'car',
    submittedAt: '2026-08-12 14:00',
    status: 'REJECTED',
    rejectReason: 'Ảnh CCCD mờ, không đọc được số',
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function KycReviewPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState<KycRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

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

  // Stats
  const pending = records.filter((r) => r.status === 'PENDING').length;
  const approved = records.filter((r) => r.status === 'APPROVED').length;
  const rejected = records.filter((r) => r.status === 'REJECTED').length;

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/admin/shippers/${id}/kyc`, { status: 'VERIFIED' });
    },
    onSuccess: () => {
      message.success('✅ Đã duyệt hồ sơ KYC!');
      queryClient.invalidateQueries({ queryKey: KYC_QUERY_KEYS.all });
      setDrawerOpen(false);
    },
    onError: () => message.error('Có lỗi xảy ra, thử lại!'),
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await apiClient.patch(`/admin/shippers/${id}/kyc`, {
        status: 'REJECTED',
        rejectReason: reason,
      });
    },
    onSuccess: () => {
      message.success('Đã từ chối hồ sơ!');
      queryClient.invalidateQueries({ queryKey: KYC_QUERY_KEYS.all });
      setDrawerOpen(false);
      setShowRejectInput(false);
      setRejectReason('');
    },
    onError: () => message.error('Có lỗi xảy ra!'),
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
      title: 'Xác nhận duyệt hồ sơ KYC?',
      content: `Tài khoản shipper "${selectedRecord.name}" sẽ được kích hoạt.`,
      okText: 'Duyệt ngay',
      okButtonProps: { style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } },
      cancelText: 'Hủy',
      onOk: () => approveMutation.mutate(selectedRecord.id),
    });
  };

  const handleReject = () => {
    if (!selectedRecord || !rejectReason.trim()) {
      message.warning('Vui lòng nhập lý do từ chối!');

      return;
    }
    rejectMutation.mutate({ id: selectedRecord.id, reason: rejectReason.trim() });
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        title: 'Shipper',
        key: 'shipper',
        render: (_: unknown, rec: KycRecord) => (
          <Space>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#f97316' }} />
            <Space direction="vertical" size={0}>
              <Text strong>{rec.name}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {rec.phone}
              </Text>
            </Space>
          </Space>
        ),
      },
      {
        title: 'CCCD',
        dataIndex: 'cccd',
        key: 'cccd',
        render: (v: string) => <Text code>{v}</Text>,
      },
      {
        title: 'Phương tiện',
        dataIndex: 'vehicleType',
        key: 'vehicleType',
        render: (v: string) => VEHICLE_LABELS[v] ?? v,
      },
      {
        title: 'Ngày nộp',
        dataIndex: 'submittedAt',
        key: 'submittedAt',
        render: (v: string) => <Text type="secondary">{v}</Text>,
      },
      {
        title: 'Trạng thái',
        key: 'status',
        render: (_: unknown, rec: KycRecord) => <KycStatusBadge status={rec.status} />,
      },
      {
        title: 'Hành động',
        key: 'actions',
        render: (_: unknown, rec: KycRecord) => (
          <Button
            icon={<EyeOutlined />}
            onClick={() => openDrawer(rec)}
            disabled={rec.status !== 'PENDING'}
          >
            {rec.status === 'PENDING' ? 'Xem xét' : 'Đã xử lý'}
          </Button>
        ),
      },
    ],
    [openDrawer],
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
        title="Duyệt Hồ Sơ KYC Shipper"
        subtitle="Xem xét và phê duyệt hồ sơ xác minh danh tính của các shipper đăng ký mới"
      />

      {/* Stats row */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card variant="borderless" className="rounded-xl shadow-sm">
            <Statistic
              title="⏳ Chờ duyệt"
              value={pending}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" className="rounded-xl shadow-sm">
            <Statistic
              title="✅ Đã duyệt"
              value={approved}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" className="rounded-xl shadow-sm">
            <Statistic
              title="❌ Từ chối"
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
            searchPlaceholder="Tìm theo tên, SĐT, số CCCD..."
            searchValue={search}
            onSearchChange={(v) => setSearch(v)}
            filterLabel="Trạng thái:"
            filterValue={statusFilter}
            onFilterChange={(v) => setStatusFilter(v)}
            filterOptions={KYC_STATUS_FILTER_OPTIONS}
          />
          <div className="flex justify-end">
            <Tooltip title="Làm mới danh sách">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => queryClient.invalidateQueries({ queryKey: KYC_QUERY_KEYS.all })}
              >
                Làm mới
              </Button>
            </Tooltip>
          </div>
          <DataTable<KycRecord>
            rowKey="key"
            columns={columns}
            dataSource={filteredRecords}
            loading={isLoading}
            scroll={{ x: 900 }}
            emptyDescription="Không có hồ sơ KYC nào"
          />
        </Space>
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title={
          <Space>
            <IdcardOutlined />
            <span>Hồ Sơ KYC — {selectedRecord?.name}</span>
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
                    placeholder="Nhập lý do từ chối..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <Button
                    danger
                    onClick={handleReject}
                    loading={rejectMutation.isPending}
                    icon={<CloseCircleOutlined />}
                  >
                    Xác nhận từ chối
                  </Button>
                  <Button onClick={() => setShowRejectInput(false)}>Hủy</Button>
                </>
              ) : (
                <>
                  <Button
                    danger
                    onClick={() => setShowRejectInput(true)}
                    icon={<CloseCircleOutlined />}
                  >
                    Từ chối
                  </Button>
                  <Button
                    type="primary"
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    onClick={handleApprove}
                    loading={approveMutation.isPending}
                    icon={<CheckCircleOutlined />}
                  >
                    Duyệt KYC
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
            <Descriptions title="Thông tin cá nhân" bordered size="small" column={1}>
              <Descriptions.Item label="Họ và tên">
                <Text strong>{selectedRecord.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedRecord.phone}</Descriptions.Item>
              <Descriptions.Item label="Số CCCD">
                <Text code>{selectedRecord.cccd}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phương tiện">
                {VEHICLE_LABELS[selectedRecord.vehicleType] ?? selectedRecord.vehicleType}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày nộp hồ sơ">
                {selectedRecord.submittedAt}
              </Descriptions.Item>
              {selectedRecord.rejectReason && (
                <Descriptions.Item label="Lý do từ chối">
                  <Text type="danger">{selectedRecord.rejectReason}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Document images */}
            <div>
              <Title level={5} className="mb-3">
                <FileImageOutlined className="mr-2" />
                Ảnh giấy tờ
              </Title>
              <Row gutter={[12, 12]}>
                {[
                  { label: 'CCCD mặt trước', url: selectedRecord.cccdFrontUrl },
                  { label: 'CCCD mặt sau', url: selectedRecord.cccdBackUrl },
                  { label: 'Bằng lái xe', url: selectedRecord.driverLicenseUrl },
                  { label: 'Đăng ký xe', url: selectedRecord.vehicleRegUrl },
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
                          <div className="text-xs mt-2">Chưa có ảnh</div>
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
                Ảnh selfie xác minh
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
                  <div className="text-xs mt-2">Chưa có selfie</div>
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

function KycStatusBadge({ status }: { status: KycRecord['status'] }) {
  const config = {
    PENDING: { color: 'orange', label: '⏳ Chờ duyệt' },
    APPROVED: { color: 'green', label: '✅ Đã duyệt' },
    REJECTED: { color: 'red', label: '❌ Từ chối' },
  }[status];

  return <Tag color={config.color}>{config.label}</Tag>;
}
