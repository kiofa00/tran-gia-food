import 'package:flutter/material.dart';
import 'variables_page.dart';
import 'functions_page.dart';
import 'lists_maps_page.dart';
import 'classes_page.dart';
import 'null_safety_page.dart';
import 'async_page.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final topics = [
      _Topic(
        title: 'Variables & Types',
        subtitle: 'var, int, String, bool, const, final',
        icon: Icons.data_object,
        color: const Color(0xFF6C63FF),
        page: const VariablesPage(),
      ),
      _Topic(
        title: 'Functions',
        subtitle: 'Parameters, arrow functions, named params',
        icon: Icons.functions,
        color: const Color(0xFF00BCD4),
        page: const FunctionsPage(),
      ),
      _Topic(
        title: 'Lists & Maps',
        subtitle: 'Collections, iteration, manipulation',
        icon: Icons.list_alt,
        color: const Color(0xFF4CAF50),
        page: const ListsMapsPage(),
      ),
      _Topic(
        title: 'Classes & OOP',
        subtitle: 'Constructor, methods, inheritance',
        icon: Icons.class_,
        color: const Color(0xFFFF9800),
        page: const ClassesPage(),
      ),
      _Topic(
        title: 'Null Safety',
        subtitle: '?, ??, !, nullable types',
        icon: Icons.security,
        color: const Color(0xFFE91E63),
        page: const NullSafetyPage(),
      ),
      _Topic(
        title: 'Async / Await',
        subtitle: 'Future, async, await, API simulation',
        icon: Icons.sync,
        color: const Color(0xFF9C27B0),
        page: const AsyncPage(),
      ),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 12),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF6C63FF).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.flutter_dash,
                        color: Color(0xFF6C63FF), size: 28),
                  ),
                  const SizedBox(width: 12),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Dart Language',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'Interactive Demo',
                        style: TextStyle(
                          fontSize: 13,
                          color: Color(0xFF6C63FF),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 8),
              const Padding(
                padding: EdgeInsets.only(top: 8, bottom: 16),
                child: Text(
                  'Tap a topic to explore with live examples',
                  style: TextStyle(color: Colors.white54, fontSize: 13),
                ),
              ),
              Expanded(
                child: GridView.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 14,
                    mainAxisSpacing: 14,
                    childAspectRatio: 1.0,
                  ),
                  itemCount: topics.length,
                  itemBuilder: (context, index) {
                    final topic = topics[index];
                    return _TopicCard(topic: topic);
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Topic {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final Widget page;

  _Topic({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.page,
  });
}

class _TopicCard extends StatelessWidget {
  final _Topic topic;

  const _TopicCard({required this.topic});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => topic.page),
      ),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              topic.color.withValues(alpha: 0.25),
              topic.color.withValues(alpha: 0.08),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: topic.color.withValues(alpha: 0.35), width: 1.2),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: topic.color.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(topic.icon, color: topic.color, size: 26),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    topic.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    topic.subtitle,
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.white.withValues(alpha: 0.55),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
