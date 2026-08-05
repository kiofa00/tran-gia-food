import 'package:flutter/material.dart';
import 'demo_scaffold.dart';

class NullSafetyPage extends StatefulWidget {
  const NullSafetyPage({super.key});

  @override
  State<NullSafetyPage> createState() => _NullSafetyPageState();
}

class _NullSafetyPageState extends State<NullSafetyPage> {
  // Nullable variables
  String? nickname;
  String? city = 'Hanoi';
  int? score;

  bool _hasNickname = false;
  bool _hasScore = false;

  @override
  Widget build(BuildContext context) {
    // ?? — null fallback
    final displayName = nickname ?? 'Unknown';

    // ?. — safe access (won't crash if null)
    final nicknameLength = nickname?.length;

    // ternary with null check
    final scoreDisplay = score != null ? 'Score: $score' : 'No score set';

    // null-safe chaining
    final upperCity = city?.toUpperCase() ?? 'NO CITY';

    return DemoScaffold(
      title: 'Null Safety',
      color: const Color(0xFFE91E63),
      sections: [
        DemoSection(
          label: 'String?  — nullable type',
          code:
              'String? nickname; // can be null\nString? city = \'Hanoi\'; // can be null or String',
          result: '',
          resultWidget: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _nullSwitch(
                'nickname',
                _hasNickname,
                (v) => setState(() {
                  _hasNickname = v;
                  nickname = v ? 'DartDev' : null;
                }),
              ),
              const SizedBox(height: 4),
              Text(
                'nickname = ${nickname == null ? 'null' : "'$nickname'"}',
                style: TextStyle(
                  color: nickname == null ? Colors.red[300] : Colors.green[300],
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ),
        DemoSection(
          label: '??  — null fallback (if null, use default)',
          code:
              "String? nickname;\nfinal display = nickname ?? 'Unknown';\n// → 'Unknown' when null",
          result: "nickname ?? 'Unknown'  →  $displayName",
        ),
        DemoSection(
          label: '?.  — safe access (no crash when null)',
          code: "nickname?.length\n// returns null instead of crashing",
          result: "nickname?.length  →  ${nicknameLength ?? 'null'}",
        ),
        DemoSection(
          label: '?.  chaining',
          code:
              "city?.toUpperCase() ?? 'NO CITY'\n// safe even if city is null",
          result: "city?.toUpperCase()  →  $upperCity",
        ),
        DemoSection(
          label: 'int?  — toggle null / value',
          code: "int? score;\nif (score != null) { ... }",
          result: '',
          resultWidget: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _nullSwitch(
                'score has value',
                _hasScore,
                (v) => setState(() {
                  _hasScore = v;
                  score = v ? 95 : null;
                }),
              ),
              const SizedBox(height: 4),
              Text(
                scoreDisplay,
                style: TextStyle(
                  color: score == null ? Colors.red[300] : Colors.green[300],
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        DemoSection(
          label: '!  — force unwrap (use with caution!)',
          code:
              "// Only use ! when you're SURE it's not null\nnickname!.length  // crashes if null ⚠️",
          result: _hasNickname
              ? 'nickname!.length = ${nickname!.length} ✅ safe now'
              : 'nickname is null → ! would CRASH ⚠️',
        ),
      ],
    );
  }

  Widget _nullSwitch(String label, bool value, ValueChanged<bool> onChanged) {
    return Row(
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 13),
        ),
        const Spacer(),
        Switch(
          value: value,
          activeThumbColor: const Color(0xFFE91E63),
          onChanged: onChanged,
        ),
      ],
    );
  }
}
