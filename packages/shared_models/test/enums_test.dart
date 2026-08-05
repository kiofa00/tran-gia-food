import 'package:flutter_test/flutter_test.dart';
import 'package:shared_models/enums/index.dart';

void main() {
  group('OrderStatus Enum Tests', () {
    test('isActive returns true for active order states', () {
      expect(OrderStatus.pending.isActive, isTrue);
      expect(OrderStatus.confirmed.isActive, isTrue);
      expect(OrderStatus.pickingUp.isActive, isTrue);
      expect(OrderStatus.delivering.isActive, isTrue);
      expect(OrderStatus.delivered.isActive, isTrue);
    });

    test('isActive returns false for completed and cancelled order states', () {
      expect(OrderStatus.completed.isActive, isFalse);
      expect(OrderStatus.cancelled.isActive, isFalse);
    });

    test('label returns correct i18n translation key', () {
      expect(OrderStatus.pending.label, equals('order.status_pending'));
      expect(OrderStatus.completed.label, equals('order.status_completed'));
    });
  });
}
