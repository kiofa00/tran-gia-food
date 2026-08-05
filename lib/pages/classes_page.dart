import 'package:flutter/material.dart';
import 'demo_scaffold.dart';

// ── Dart classes defined here ────────────────────────────────────

class Product {
  String name;
  double price;

  // Constructor
  Product({required this.name, required this.price});

  // Method
  String display() => '$name — \$${price.toStringAsFixed(2)}';

  // Getter
  bool get isExpensive => price > 100;
}

// Inheritance
class DiscountedProduct extends Product {
  double discount;

  DiscountedProduct({
    required super.name,
    required super.price,
    required this.discount,
  });

  double get finalPrice => price - discount;

  @override
  String display() => '${super.display()} (Save \$$discount)';
}

// ── Page Widget ──────────────────────────────────────────────────

class ClassesPage extends StatefulWidget {
  const ClassesPage({super.key});

  @override
  State<ClassesPage> createState() => _ClassesPageState();
}

class _ClassesPageState extends State<ClassesPage> {
  // Create instances of our classes
  final phone = Product(name: 'Smartphone', price: 299.99);
  final laptop = DiscountedProduct(name: 'Laptop', price: 999.99, discount: 150);

  @override
  Widget build(BuildContext context) {
    return DemoScaffold(
      title: 'Classes & OOP',
      color: const Color(0xFFFF9800),
      sections: [
        DemoSection(
          label: 'Class definition',
          code:
              'class Product {\n  String name;\n  double price;\n\n  Product({required this.name, required this.price});\n\n  String display() => \'\$name — \\\$\${price}\'; // method\n  bool get isExpensive => price > 100; // getter\n}',
          result: '',
          resultWidget: _productCard(phone),
        ),
        DemoSection(
          label: 'Accessing properties & methods',
          code:
              "var p = Product(name: 'Smartphone', price: 299.99);\np.display()      → '${phone.display()}'\np.isExpensive    → ${phone.isExpensive}\np.name           → '${phone.name}'\np.price          → ${phone.price}",
          result: '',
          resultWidget: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _propRow('p.display()', phone.display()),
              _propRow('p.isExpensive', phone.isExpensive.toString()),
              _propRow('p.name', phone.name),
              _propRow('p.price', '\$${phone.price}'),
            ],
          ),
        ),
        DemoSection(
          label: 'Inheritance  extends',
          code:
              r'class DiscountedProduct extends Product {' '\n' +
              r'  double discount;' + '\n\n' +
              r'  double get finalPrice => price - discount;' + '\n\n' +
              r'  @override' + '\n' +
              r'  String display() => super.display() + " (Save $discount)";' + '\n' +
              r'}',
          result: '',
          resultWidget: _discountCard(laptop),
        ),
        DemoSection(
          label: '@override — polymorphism',
          code:
              "// Both share the same .display() method name\n// but behave differently:\nproduct.display()    → '${phone.display()}'\ndiscounted.display() → '${laptop.display()}'",
          result: '',
          resultWidget: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _propRow('Product.display()', phone.display()),
              _propRow('Discounted.display()', laptop.display()),
              _propRow('finalPrice', '\$${laptop.finalPrice}'),
            ],
          ),
        ),
      ],
    );
  }

  Widget _productCard(Product p) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white10,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          const Icon(Icons.phone_android, color: Color(0xFFFF9800), size: 32),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(p.name,
                  style: const TextStyle(
                      color: Colors.white, fontWeight: FontWeight.bold)),
              Text('\$${p.price}',
                  style: const TextStyle(color: Color(0xFFFF9800), fontSize: 13)),
              Text(p.isExpensive ? '⚡ Expensive' : '✅ Affordable',
                  style: TextStyle(
                      color: p.isExpensive ? Colors.orange : Colors.green,
                      fontSize: 12)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _discountCard(DiscountedProduct p) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white10,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          const Icon(Icons.laptop, color: Color(0xFFFF9800), size: 32),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(p.name,
                  style: const TextStyle(
                      color: Colors.white, fontWeight: FontWeight.bold)),
              Text('\$${p.price}',
                  style: const TextStyle(
                      color: Colors.white38,
                      decoration: TextDecoration.lineThrough,
                      fontSize: 12)),
              Text('\$${p.finalPrice} (Save \$${p.discount})',
                  style: const TextStyle(
                      color: Color(0xFFFF9800),
                      fontWeight: FontWeight.bold,
                      fontSize: 13)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _propRow(String prop, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Text(prop,
              style: const TextStyle(color: Color(0xFFFF9800), fontSize: 12)),
          const Text(' → ',
              style: TextStyle(color: Colors.white38, fontSize: 12)),
          Expanded(
            child: Text(value,
                style: const TextStyle(color: Colors.white, fontSize: 12)),
          ),
        ],
      ),
    );
  }
}
