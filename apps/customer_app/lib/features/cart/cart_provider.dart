import 'package:flutter_riverpod/flutter_riverpod.dart';

class CartItem {
  final String id;
  final String name;
  final int price;
  final int quantity;
  final String? imageUrl;
  final String restaurantId;
  final String restaurantName;

  const CartItem({
    required this.id,
    required this.name,
    required this.price,
    required this.quantity,
    this.imageUrl,
    required this.restaurantId,
    required this.restaurantName,
  });

  CartItem copyWith({
    String? id,
    String? name,
    int? price,
    int? quantity,
    String? imageUrl,
    String? restaurantId,
    String? restaurantName,
  }) {
    return CartItem(
      id: id ?? this.id,
      name: name ?? this.name,
      price: price ?? this.price,
      quantity: quantity ?? this.quantity,
      imageUrl: imageUrl ?? this.imageUrl,
      restaurantId: restaurantId ?? this.restaurantId,
      restaurantName: restaurantName ?? this.restaurantName,
    );
  }
}

class CartVoucher {
  final String code;
  final String title;
  final int discountAmount;
  final String discountType;
  final int minOrderValue;

  const CartVoucher({
    required this.code,
    required this.title,
    required this.discountAmount,
    required this.discountType,
    this.minOrderValue = 0,
  });
}

class CartState {
  final String? restaurantId;
  final String? restaurantName;
  final Map<String, CartItem> items;
  final CartVoucher? appliedVoucher;

  const CartState({
    this.restaurantId,
    this.restaurantName,
    this.items = const {},
    this.appliedVoucher,
  });

  int get totalCount => totalItemCount;
  String? get voucherCode => appliedVoucher?.code;
  int get totalItemCount => items.values.fold(0, (sum, item) => sum + item.quantity);
  int get subtotal => items.values.fold(0, (sum, item) => sum + (item.price * item.quantity));
  int get shippingFee => items.isEmpty ? 0 : 16000;
  int get discountAmount => appliedVoucher?.discountAmount ?? 0;
  int get total => (subtotal + shippingFee - discountAmount).clamp(0, 999999999);
  bool get isEmpty => items.isEmpty;

  CartState copyWith({
    String? restaurantId,
    String? restaurantName,
    Map<String, CartItem>? items,
    CartVoucher? appliedVoucher,
    bool clearVoucher = false,
  }) {
    return CartState(
      restaurantId: restaurantId ?? this.restaurantId,
      restaurantName: restaurantName ?? this.restaurantName,
      items: items ?? this.items,
      appliedVoucher: clearVoucher ? null : (appliedVoucher ?? this.appliedVoucher),
    );
  }
}

class CartNotifier extends Notifier<CartState> {
  @override
  CartState build() {
    return const CartState();
  }

  void updateQuantity(String id, int quantity) => setQuantity(id, quantity);

  void setVoucher(String code, int discountAmount) {
    applyVoucher(CartVoucher(
      code: code,
      title: code,
      discountAmount: discountAmount,
      discountType: 'fixed',
    ));
  }

  void addItem({
    required String id,
    required String name,
    required int price,
    String? imageUrl,
    required String restaurantId,
    required String restaurantName,
  }) {
    // If cart already has items from another restaurant, reset cart for new restaurant
    if (state.restaurantId != null && state.restaurantId != restaurantId && state.items.isNotEmpty) {
      state = CartState(
        restaurantId: restaurantId,
        restaurantName: restaurantName,
        items: {
          id: CartItem(
            id: id,
            name: name,
            price: price,
            quantity: 1,
            imageUrl: imageUrl,
            restaurantId: restaurantId,
            restaurantName: restaurantName,
          ),
        },
      );
      return;
    }

    final newItems = Map<String, CartItem>.from(state.items);
    if (newItems.containsKey(id)) {
      final existing = newItems[id]!;
      newItems[id] = existing.copyWith(quantity: existing.quantity + 1);
    } else {
      newItems[id] = CartItem(
        id: id,
        name: name,
        price: price,
        quantity: 1,
        imageUrl: imageUrl,
        restaurantId: restaurantId,
        restaurantName: restaurantName,
      );
    }

    state = state.copyWith(
      restaurantId: restaurantId,
      restaurantName: restaurantName,
      items: newItems,
    );
  }

  void removeItem(String id) {
    if (!state.items.containsKey(id)) return;

    final newItems = Map<String, CartItem>.from(state.items);
    final existing = newItems[id]!;
    if (existing.quantity > 1) {
      newItems[id] = existing.copyWith(quantity: existing.quantity - 1);
    } else {
      newItems.remove(id);
    }

    if (newItems.isEmpty) {
      state = const CartState();
    } else {
      state = state.copyWith(items: newItems);
    }
  }

  void setQuantity(String id, int quantity) {
    if (!state.items.containsKey(id)) return;

    final newItems = Map<String, CartItem>.from(state.items);
    if (quantity <= 0) {
      newItems.remove(id);
    } else {
      newItems[id] = newItems[id]!.copyWith(quantity: quantity);
    }

    if (newItems.isEmpty) {
      state = const CartState();
    } else {
      state = state.copyWith(items: newItems);
    }
  }

  void applyVoucher(CartVoucher voucher) {
    state = state.copyWith(appliedVoucher: voucher);
  }

  void removeVoucher() {
    state = state.copyWith(clearVoucher: true);
  }

  void clearCart() {
    state = const CartState();
  }
}

final cartProvider = NotifierProvider<CartNotifier, CartState>(CartNotifier.new);
