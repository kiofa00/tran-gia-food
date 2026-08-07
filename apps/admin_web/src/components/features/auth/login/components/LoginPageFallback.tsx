import { Card, Skeleton } from 'antd';

export function LoginPageFallback() {
  return (
    <Card
      className="w-full max-w-md rounded-2xl shadow-2xl border-0"
      styles={{ body: { padding: '40px 36px' } }}
    >
      <div className="text-center mb-8">
        <div className="text-5xl mb-2">🍜</div>
      </div>
      <Skeleton.Input active block style={{ marginBottom: 24, height: 40 }} />
      <Skeleton.Input active block style={{ marginBottom: 24, height: 40 }} />
      <Skeleton.Button active block style={{ height: 48 }} />
    </Card>
  );
}
