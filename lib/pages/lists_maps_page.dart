import 'package:flutter/material.dart';
import 'demo_scaffold.dart';

class ListsMapsPage extends StatefulWidget {
  const ListsMapsPage({super.key});

  @override
  State<ListsMapsPage> createState() => _ListsMapsPageState();
}

class _ListsMapsPageState extends State<ListsMapsPage> {
  // ── Lists ────────────────────────────────────────────────────
  List<String> fruits = ['Apple', 'Banana', 'Mango'];
  final _controller = TextEditingController();

  // ── Maps ─────────────────────────────────────────────────────
  final Map<String, dynamic> user = {
    'name': 'Tran Gia',
    'age': 25,
    'active': true,
  };

  // ── Set ──────────────────────────────────────────────────────
  final Set<int> numbers = {1, 2, 3, 3, 4, 4, 5}; // duplicates removed

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // List operations for demo
    final doubled = [1, 2, 3, 4].map((x) => x * 2).toList();
    final evens = [1, 2, 3, 4, 5, 6].where((x) => x.isEven).toList();
    final sum = [1, 2, 3, 4, 5].fold<int>(0, (acc, x) => acc + x);

    return DemoScaffold(
      title: 'Lists & Maps',
      color: const Color(0xFF4CAF50),
      sections: [
        // Interactive list
        DemoSection(
          label: 'List<String>  — add / remove items',
          code:
              "List<String> fruits = ['Apple', 'Banana', 'Mango'];\nfruits.add('Orange');\nfruits.remove('Apple');",
          result: fruits.toString(),
          resultWidget: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ...fruits.map(
                (f) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 3),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.circle,
                        size: 6,
                        color: Color(0xFF4CAF50),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          f,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      GestureDetector(
                        onTap: () => setState(() => fruits.remove(f)),
                        child: const Icon(
                          Icons.close,
                          color: Colors.red,
                          size: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'Add a fruit...',
                        hintStyle: const TextStyle(color: Colors.white38),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                        filled: true,
                        fillColor: Colors.white10,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () {
                      if (_controller.text.isNotEmpty) {
                        setState(() {
                          fruits.add(_controller.text.trim());
                          _controller.clear();
                        });
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF4CAF50),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.add,
                        color: Colors.white,
                        size: 18,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        DemoSection(
          label: '.map()  — transform each item',
          code: '[1,2,3,4].map((x) => x * 2).toList()',
          result: doubled.toString(),
        ),
        DemoSection(
          label: '.where()  — filter items',
          code: '[1,2,3,4,5,6].where((x) => x.isEven).toList()',
          result: evens.toString(),
        ),
        DemoSection(
          label: '.fold()  — reduce to single value',
          code: '[1,2,3,4,5].fold(0, (acc, x) => acc + x)',
          result: 'Sum = $sum',
        ),
        DemoSection(
          label: 'Map<String, dynamic>',
          code:
              "Map<String, dynamic> user = {\n  'name': 'Tran Gia',\n  'age': 25,\n}",
          result: user.toString(),
          resultWidget: Column(
            children: user.entries
                .map(
                  (e) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 3),
                    child: Row(
                      children: [
                        Text(
                          "'${e.key}':",
                          style: const TextStyle(
                            color: Color(0xFF4CAF50),
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          e.value.toString(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                )
                .toList(),
          ),
        ),
        DemoSection(
          label: 'Set  — unique values only',
          code:
              'Set<int> numbers = {1, 2, 3, 3, 4, 4, 5};\n// duplicates auto-removed',
          result: numbers.toString(),
        ),
      ],
    );
  }
}
