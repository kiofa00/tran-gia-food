import 'package:flutter/material.dart';
import 'demo_scaffold.dart';

class FunctionsPage extends StatefulWidget {
  const FunctionsPage({super.key});

  @override
  State<FunctionsPage> createState() => _FunctionsPageState();
}

class _FunctionsPageState extends State<FunctionsPage> {
  // ── Dart functions ───────────────────────────────────────────

  // 1. Basic function with return type
  String greet(String name) {
    return 'Hello, $name!';
  }

  // 2. Arrow function (single expression)
  int add(int a, int b) => a + b;

  // 3. Named parameters with default value
  String describe({required String name, int age = 0}) {
    return '$name is $age years old';
  }

  // 4. Optional positional parameter
  String repeat(String word, [int times = 2]) {
    return ('$word ') * times;
  }

  // 5. Higher-order function (takes a function as param)
  List<int> applyToList(List<int> list, int Function(int) fn) {
    return list.map(fn).toList();
  }

  // State for interactive demo
  int _numA = 3;
  int _numB = 7;

  @override
  Widget build(BuildContext context) {
    return DemoScaffold(
      title: 'Functions',
      color: const Color(0xFF00BCD4),
      sections: [
        DemoSection(
          label: 'Basic function',
          code: "String greet(String name) {\n  return 'Hello, \$name!';\n}",
          result: greet('Flutter'),
        ),
        DemoSection(
          label: 'Arrow function  =>',
          code: 'int add(int a, int b) => a + b;',
          result: 'add(3, 7) = ${add(3, 7)}',
          resultWidget: Row(
            children: [
              _counter('A', _numA, (v) => setState(() => _numA = v)),
              const SizedBox(width: 8),
              Text('+', style: TextStyle(color: Colors.white70, fontSize: 18)),
              const SizedBox(width: 8),
              _counter('B', _numB, (v) => setState(() => _numB = v)),
              const SizedBox(width: 12),
              Text(
                '= ${add(_numA, _numB)}',
                style: const TextStyle(
                    color: Color(0xFF00BCD4),
                    fontSize: 20,
                    fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
        DemoSection(
          label: 'Named parameters  {}',
          code:
              "String describe({required String name, int age = 0}) => ...\n\ndescribe(name: 'Tran', age: 25)",
          result: describe(name: 'Tran', age: 25),
        ),
        DemoSection(
          label: 'Optional positional  []',
          code: "String repeat(String word, [int times = 2]) => ...\n\nrepeat('Dart') → 'Dart Dart '",
          result: repeat('Dart'),
        ),
        DemoSection(
          label: 'Higher-order function',
          code:
              "List<int> applyToList(List<int> list, int Function(int) fn)\n\napplyToList([1,2,3,4], (x) => x * 2)",
          result: applyToList([1, 2, 3, 4], (x) => x * 2).toString(),
        ),
      ],
    );
  }

  Widget _counter(String label, int value, ValueChanged<int> onChange) {
    return Row(
      children: [
        Text('$label:', style: const TextStyle(color: Colors.white54, fontSize: 12)),
        const SizedBox(width: 4),
        GestureDetector(
          onTap: () => onChange(value - 1),
          child: const Icon(Icons.remove_circle_outline,
              color: Color(0xFF00BCD4), size: 20),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Text('$value',
              style: const TextStyle(color: Colors.white, fontSize: 16)),
        ),
        GestureDetector(
          onTap: () => onChange(value + 1),
          child: const Icon(Icons.add_circle_outline,
              color: Color(0xFF00BCD4), size: 20),
        ),
      ],
    );
  }
}
