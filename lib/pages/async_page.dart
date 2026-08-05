import 'package:flutter/material.dart';
import 'demo_scaffold.dart';

class AsyncPage extends StatefulWidget {
  const AsyncPage({super.key});

  @override
  State<AsyncPage> createState() => _AsyncPageState();
}

class _AsyncPageState extends State<AsyncPage> {
  // ── Async state ──────────────────────────────────────────────
  String _status = 'idle';
  String _result = '';
  bool _loading = false;

  String _status2 = 'idle';
  String _result2 = '';
  bool _loading2 = false;

  // ── Simulated async functions ────────────────────────────────

  // Simulates an API call with delay
  Future<String> fetchUser() async {
    await Future.delayed(const Duration(seconds: 2)); // simulate network
    return '{"name": "Tran Gia", "role": "Developer"}';
  }

  // Simulates a failing API call
  Future<String> fetchWithError() async {
    await Future.delayed(const Duration(seconds: 2));
    throw Exception('Network error: 404 Not Found');
  }

  Future<void> _runFetch() async {
    setState(() {
      _loading = true;
      _status = 'loading...';
      _result = '';
    });

    try {
      final data = await fetchUser(); // await pauses here
      setState(() {
        _status = 'success ✅';
        _result = data;
      });
    } catch (e) {
      setState(() {
        _status = 'error ❌';
        _result = e.toString();
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _runFetchError() async {
    setState(() {
      _loading2 = true;
      _status2 = 'loading...';
      _result2 = '';
    });

    try {
      final data = await fetchWithError();
      setState(() {
        _status2 = 'success ✅';
        _result2 = data;
      });
    } catch (e) {
      setState(() {
        _status2 = 'error ❌';
        _result2 = e.toString();
      });
    } finally {
      setState(() => _loading2 = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return DemoScaffold(
      title: 'Async / Await',
      color: const Color(0xFF9C27B0),
      sections: [
        DemoSection(
          label: 'What is Future?',
          code:
              '// Future = a value that arrives later\nFuture<String> fetchUser() async {\n  await Future.delayed(Duration(seconds: 2));\n  return \'{"name": "Tran Gia"}\';\n}',
          result: 'A Future is like a "promise" — it will return a value eventually.',
        ),
        DemoSection(
          label: 'async / await — tap to run',
          code:
              'Future<void> load() async {\n  try {\n    final data = await fetchUser();\n    // use data here\n  } catch (e) {\n    // handle error\n  }\n}',
          result: '',
          resultWidget: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ElevatedButton.icon(
                onPressed: _loading ? null : _runFetch,
                icon: _loading
                    ? const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.play_arrow, size: 16),
                label: Text(_loading ? 'Fetching...' : 'Run fetchUser()'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF9C27B0),
                  foregroundColor: Colors.white,
                  textStyle: const TextStyle(fontSize: 13),
                ),
              ),
              if (_status != 'idle') ...[
                const SizedBox(height: 8),
                Text('Status: $_status',
                    style: TextStyle(
                      color: _status.contains('✅')
                          ? Colors.green[300]
                          : _status.contains('❌')
                              ? Colors.red[300]
                              : Colors.orange[300],
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    )),
                if (_result.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white10,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      _result,
                      style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                          fontFamily: 'monospace'),
                    ),
                  ),
                ],
              ],
            ],
          ),
        ),
        DemoSection(
          label: 'try / catch — handle errors',
          code:
              'try {\n  final data = await fetchWithError();\n} catch (e) {\n  print(e); // "Network error: 404"\n} finally {\n  // always runs\n}',
          result: '',
          resultWidget: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ElevatedButton.icon(
                onPressed: _loading2 ? null : _runFetchError,
                icon: _loading2
                    ? const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.error_outline, size: 16),
                label: Text(_loading2 ? 'Fetching...' : 'Run fetchWithError()'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red[700],
                  foregroundColor: Colors.white,
                  textStyle: const TextStyle(fontSize: 13),
                ),
              ),
              if (_status2 != 'idle') ...[
                const SizedBox(height: 8),
                Text('Status: $_status2',
                    style: TextStyle(
                      color: _status2.contains('✅')
                          ? Colors.green[300]
                          : _status2.contains('❌')
                              ? Colors.red[300]
                              : Colors.orange[300],
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    )),
                if (_result2.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.red.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                    ),
                    child: Text(
                      _result2,
                      style: const TextStyle(
                          color: Colors.red,
                          fontSize: 12,
                          fontFamily: 'monospace'),
                    ),
                  ),
                ],
              ],
            ],
          ),
        ),
        DemoSection(
          label: 'FutureBuilder  — in Flutter widgets',
          code:
              "FutureBuilder<String>(\n  future: fetchUser(),\n  builder: (context, snapshot) {\n    if (snapshot.connectionState == ConnectionState.waiting)\n      return CircularProgressIndicator();\n    if (snapshot.hasError)\n      return Text('Error: \${snapshot.error}');\n    return Text(snapshot.data!);\n  },\n)",
          result: 'FutureBuilder connects async data to your UI automatically.',
        ),
      ],
    );
  }
}
