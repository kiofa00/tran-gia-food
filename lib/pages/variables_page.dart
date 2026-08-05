import 'package:flutter/material.dart';
import 'demo_scaffold.dart';

class VariablesPage extends StatefulWidget {
  const VariablesPage({super.key});

  @override
  State<VariablesPage> createState() => _VariablesPageState();
}

class _VariablesPageState extends State<VariablesPage> {
  // ── Dart variable declarations (the real code!) ─────────────
  String name = 'Tran Gia';
  int age = 25;
  double price = 99.99;
  bool isActive = true;
  var city = 'Hanoi'; // type inferred as String
  static const double pi = 3.14159; // compile-time constant — shown as a label
  late final String greeting; // set once in initState

  @override
  void initState() {
    super.initState();
    greeting = 'Hello, $name!'; // late final assigned here
  }

  @override
  Widget build(BuildContext context) {
    return DemoScaffold(
      title: 'Variables & Types',
      color: const Color(0xFF6C63FF),
      sections: [
        DemoSection(
          label: 'String',
          code: "String name = 'Tran Gia';",
          result: name,
        ),
        DemoSection(
          label: 'int',
          code: 'int age = 25;',
          result: age.toString(),
        ),
        DemoSection(
          label: 'double',
          code: 'double price = 99.99;',
          result: price.toString(),
        ),
        DemoSection(
          label: 'bool',
          code: 'bool isActive = true;',
          result: isActive.toString(),
          resultWidget: Switch(
            value: isActive,
            activeThumbColor: const Color(0xFF6C63FF),
            onChanged: (v) => setState(() => isActive = v),
          ),
        ),
        DemoSection(
          label: 'var (inferred)',
          code: "var city = 'Hanoi'; // Dart infers String",
          result: city,
        ),
        DemoSection(
          label: 'const',
          code: 'const double pi = 3.14159;',
          result: pi.toString(),
        ),
        DemoSection(
          label: 'late final',
          code: "late final String greeting;\n// assigned once in initState",
          result: greeting,
        ),
        DemoSection(
          label: 'String interpolation',
          code: r"'$name is ${age + 1} next year'",
          result: '$name is ${age + 1} next year',
        ),
      ],
    );
  }
}
