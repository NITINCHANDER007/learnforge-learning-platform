// DataDrix Curated Algorithmic Problem Catalog, Tracks, and Interview Experiences
// Complete with Python 3, JavaScript, C++, and Java templates, test suites, community discussions, and editorials.

export const ALL_COMPANIES = ['All', 'Google', 'Amazon', 'Microsoft', 'Meta', 'Flipkart', 'Apple', 'Adobe', 'TCS'];

export const DATADRIX_TRACKS = [
  {
    id: 'must-do-sde',
    title: 'Must-Do SDE Sheet (Top 50)',
    subtitle: 'High-frequency coding interview questions asked at top product tech firms',
    icon: 'Flame',
    color: '#ef4444',
    badge: 'Recommended',
    problemSlugs: [
      'subarray-with-given-sum',
      'kadanes-algorithm',
      'trapping-rain-water',
      'parenthesis-checker',
      'two-sum',
      '01-knapsack-problem',
      'search-in-rotated-sorted-array',
      'longest-common-subsequence'
    ]
  },
  {
    id: 'datadrix-160',
    title: 'DataDrix 160: Core Algorithmic Mastery',
    subtitle: '160-day structured roadmap from fundamentals to advanced trees, graphs & DP',
    icon: 'Zap',
    color: '#3b82f6',
    badge: 'Flagship Track',
    problemSlugs: [
      'subarray-with-given-sum',
      'kadanes-algorithm',
      'binary-search',
      'parenthesis-checker',
      'reverse-words-in-string',
      'coin-change',
      'word-break',
      'missing-number',
      'fizzbuzz'
    ]
  },
  {
    id: 'faang-sprint',
    title: 'FAANG / Tier-1 Product Sprint',
    subtitle: 'High-bar algorithmic challenges asked at Google, Amazon, Meta, and Microsoft',
    icon: 'Award',
    color: '#8b5cf6',
    badge: 'Tier 1 Focus',
    problemSlugs: [
      'trapping-rain-water',
      'word-break',
      '01-knapsack-problem',
      'search-in-rotated-sorted-array',
      'longest-common-subsequence',
      'next-greater-element',
      'two-sum'
    ]
  },
  {
    id: 'dp-master',
    title: 'Dynamic Programming Patterns',
    subtitle: 'Master the 5 classic DP patterns: Knapsack, Subsequence, Coin Change, and Word Break',
    icon: 'Layers',
    color: '#10b981',
    badge: 'DP Mastery',
    problemSlugs: [
      '01-knapsack-problem',
      'coin-change',
      'longest-common-subsequence',
      'word-break',
      'kadanes-algorithm'
    ]
  },
  {
    id: 'stack-two-pointer',
    title: 'Two Pointers & Monotonic Stack',
    subtitle: 'Linear time O(N) patterns that eliminate nested loops and quadratic complexity',
    icon: 'Compass',
    color: '#f59e0b',
    badge: 'Fast Techniques',
    problemSlugs: [
      'subarray-with-given-sum',
      'trapping-rain-water',
      'parenthesis-checker',
      'next-greater-element',
      'reverse-words-in-string',
      'two-sum'
    ]
  }
];

export const DATADRIX_INTERVIEW_EXPERIENCES = [
  {
    id: 'exp-amazon-sde1',
    company: 'Amazon',
    role: 'SDE-1 (Software Development Engineer)',
    location: 'Bangalore, India',
    date: 'Recent Cycle (2025/2026)',
    verdict: 'Selected (Offer Extended)',
    verdictType: 'selected',
    difficulty: 'Medium-Hard',
    compensation: '₹44 - 48 LPA CTC',
    rounds: [
      {
        name: 'Online Assessment (OA) — Hackerrank (90 mins)',
        details: '2 Algorithmic problems: 1 sliding window problem closely related to "Subarray with Given Sum", and 1 priority queue problem. Followed by a 20-minute Work Style Assessment based on Amazon Leadership Principles.'
      },
      {
        name: 'Technical Round 1 — Virtual Onsite (60 mins)',
        details: 'Interviewer was an SDE-2 from Prime Video. Problem 1 was "Kadane’s Algorithm" modified for circular buffers. Then explored how the OS kernel manages process memory and cache line invalidation.'
      },
      {
        name: 'Technical Round 2 — Data Structures & LLD (60 mins)',
        details: 'Asked "Trapping Rain Water". Started with O(N) space using prefix/suffix arrays, then optimized to O(1) auxiliary space using two pointers. Designed class hierarchy for Amazon Automated Lockers.'
      },
      {
        name: 'Bar Raiser & Leadership Principles (60 mins)',
        details: 'Conducted by a Principal Engineer from AWS Seattle. Thorough dive into Customer Obsession and Bias for Action using the STAR framework. Final coding challenge was a Trie-based autocomplete.'
      }
    ],
    keyTips: 'Do not ignore Amazon Leadership Principles. Every technical interviewer reserves 15-20 minutes for behavioral STAR stories. Write clean, defensive code with explicit variable names.',
    relatedProblems: ['subarray-with-given-sum', 'kadanes-algorithm', 'trapping-rain-water']
  },
  {
    id: 'exp-google-swe2',
    company: 'Google',
    role: 'Software Engineer (SWE-II)',
    location: 'Hyderabad, India',
    date: 'Recent Cycle (2025/2026)',
    verdict: 'Selected (Offer Extended)',
    verdictType: 'selected',
    difficulty: 'Hard',
    compensation: '₹55 - 62 LPA CTC',
    rounds: [
      {
        name: 'Technical Screening Round (45 mins)',
        details: 'Interview on Google Meet using Google Docs (no compiler). Problem was a variation of "Search in Rotated Sorted Array" with duplicate entries. Required strict proof of O(log N) average time complexity.'
      },
      {
        name: 'Onsite Coding Round 1 — Dynamic Programming (45 mins)',
        details: '2D Dynamic Programming problem similar to "Longest Common Subsequence" with edit distance constraints. Discussed space optimization from O(M*N) to O(N).'
      },
      {
        name: 'Onsite Coding Round 2 — Graphs & Shortest Paths (45 mins)',
        details: 'Directed acyclic graph traversal with topological sorting and cycle detection. Follow-up: Distributed processing of 100 million vertices.'
      },
      {
        name: 'Googlyness & Leadership Round (45 mins)',
        details: 'Hypothetical situations on handling ambiguity, advocating for technical quality under deadlines, and cross-team collaboration.'
      }
    ],
    keyTips: 'Google cares deeply about test-driven thinking. Before you code, write 4-5 test cases including empty inputs, single element, large numbers, and duplicates. Talk through your thought process continually.',
    relatedProblems: ['search-in-rotated-sorted-array', 'longest-common-subsequence', 'word-break']
  },
  {
    id: 'exp-microsoft-sde',
    company: 'Microsoft',
    role: 'Software Engineer (SDE Core)',
    location: 'Noida / Hyderabad, India',
    date: 'Recent Cycle (2025/2026)',
    verdict: 'Selected (Offer Extended)',
    verdictType: 'selected',
    difficulty: 'Medium',
    compensation: '₹42 - 46 LPA CTC',
    rounds: [
      {
        name: 'Online Assessment — Codility (75 mins)',
        details: '3 problems: String manipulation, "Parenthesis Checker", and a medium array prefix-sum task. All test cases passed with 100% score.'
      },
      {
        name: 'Technical Round 1 (45 mins)',
        details: 'Detailed implementation of "Next Greater Element" using monotonic stack. Interviewer asked to trace stack states step-by-step for arr = [6, 8, 0, 1, 3].'
      },
      {
        name: 'Technical Round 2 (45 mins)',
        details: 'Binary search variants ("Search in Rotated Sorted Array"). Follow-up: Multi-threaded producer-consumer problem using semaphores in C++/Java.'
      },
      {
        name: 'Partner Manager Round (45 mins)',
        details: 'Discussion about past project architectures, trade-offs between NoSQL and SQL databases, and why Microsoft Azure services align with career goals.'
      }
    ],
    keyTips: 'Microsoft focuses heavily on clean data structure fundamentals like Stacks, Queues, Binary Trees, and OOP principles. Practice dry-running code on whiteboard or plain editor.',
    relatedProblems: ['parenthesis-checker', 'next-greater-element', 'search-in-rotated-sorted-array']
  },
  {
    id: 'exp-flipkart-sde2',
    company: 'Flipkart',
    role: 'SDE-2 (Backend Services)',
    location: 'Bangalore, India',
    date: 'Recent Cycle (2025/2026)',
    verdict: 'Selected (Offer Extended)',
    verdictType: 'selected',
    difficulty: 'Hard',
    compensation: '₹48 - 54 LPA CTC',
    rounds: [
      {
        name: 'Machine Coding Round (90 mins)',
        details: 'Design and implement an in-memory Flash Sale Inventory Reservation engine with concurrency control, idempotency, and timeout auto-release. Working code with unit tests was required.'
      },
      {
        name: 'Data Structures & Algorithms Round (60 mins)',
        details: 'Solved a variation of "0/1 Knapsack Problem" with dynamic budget updates, followed by "Trapping Rain Water".'
      },
      {
        name: 'High-Level System Design (HLD) (60 mins)',
        details: 'Design Big Billion Days order fulfillment pipeline handling 200,000 requests/sec with Kafka, Redis caching, and Cassandra partitioning.'
      },
      {
        name: 'Hiring Manager Round (45 mins)',
        details: 'Culture fit, architectural leadership, and handling critical production incidents.'
      }
    ],
    keyTips: 'Flipkart’s machine coding round is unique: you must write production-ready, compilable code with SOLID principles in 90 minutes. Practice building clean LLD boilerplate in advance.',
    relatedProblems: ['01-knapsack-problem', 'trapping-rain-water', 'subarray-with-given-sum']
  },
  {
    id: 'exp-meta-swe',
    company: 'Meta',
    role: 'Software Engineer (Product)',
    location: 'London, UK / Remote',
    date: 'Recent Cycle (2025/2026)',
    verdict: 'Selected (Offer Extended)',
    verdictType: 'selected',
    difficulty: 'Hard',
    compensation: '£120,000 - £145,000 Total Comp',
    rounds: [
      {
        name: 'Technical Screen (45 mins)',
        details: '2 coding problems in 45 minutes: "Two Sum" with streaming data, and "Reverse Words in a String" with in-place O(1) space.'
      },
      {
        name: 'Full Loop — Coding Round 1 (45 mins)',
        details: 'Problem 1: "Subarray with Given Sum". Problem 2: "Word Break" using dynamic programming and memoization.'
      },
      {
        name: 'Full Loop — Coding Round 2 (45 mins)',
        details: 'Problem 1: "Coin Change" minimum coins. Problem 2: Graph clone with random pointers.'
      },
      {
        name: 'System Design & Behavioral (45 mins each)',
        details: 'Design Meta Instagram Stories ephemeral feed service. Discussed edge caching, CDN push vs pull, and Cassandra blob storage.'
      }
    ],
    keyTips: 'Speed is paramount at Meta: you are expected to solve TWO full medium/hard coding problems in 45 minutes with optimal complexity and flawless syntax. Do not hesitate to discuss trade-offs quickly.',
    relatedProblems: ['two-sum', 'reverse-words-in-string', 'word-break', 'coin-change']
  },
  {
    id: 'exp-tcs-digital',
    company: 'TCS',
    role: 'TCS Digital / Prime Developer',
    location: 'Pan India',
    date: 'Recent Cycle (2025/2026)',
    verdict: 'Selected (Top Rank)',
    verdictType: 'selected',
    difficulty: 'Medium',
    compensation: '₹9 - 11.5 LPA CTC',
    rounds: [
      {
        name: 'TCS NQT Advanced Coding (90 mins)',
        details: 'Part A: Advanced Quantitative & Logical Reasoning. Part B: 2 Coding Problems — "Missing Number" using bitwise XOR, and a Dynamic Programming grid path problem.'
      },
      {
        name: 'Technical & Managerial Interview (45 mins)',
        details: 'Explained differences between Python and Java memory management, executed SQL queries live for 2nd highest salary, and answered OOP principles with real banking code.'
      },
      {
        name: 'HR Round (15 mins)',
        details: 'Location preferences, shift willingness, and career aspirations in Cloud/AI.'
      }
    ],
    keyTips: 'TCS Prime test cases test corner cases strictly: negative values, zero, single element, large integers. Master basic DP and bitwise operations to ace the Advanced Coding section.',
    relatedProblems: ['missing-number', 'fizzbuzz', 'binary-search', 'parenthesis-checker']
  }
];

export const PROBLEMS_CATALOG = [
  {
    slug: 'subarray-with-given-sum',
    title: 'Subarray with Given Sum',
    difficulty: 'Medium',
    category: 'Arrays',
    companies: ['Amazon', 'Google', 'Meta', 'Flipkart', 'Visa'],
    accuracy: '46.8%',
    points: 5,
    time_complexity: 'O(N)',
    space_complexity: 'O(1)',
    hints: [
      'Can you use two pointers (sliding window) since all numbers in the array are non-negative?',
      'Keep adding elements to a current_sum until it exceeds the target. When it does, shrink from the left!',
      'Expected time complexity is O(N) with O(1) auxiliary space.'
    ],
    description: `Given an unsorted array of non-negative integers and an integer target, find a continuous sub-array that adds to target. Return the 1-based start and end indices. If no such sub-array exists, return [-1].`,
    examples: [
      { input: 'arr = [1, 2, 3, 7, 5], target = 12', output: '[2, 4]', explanation: 'Elements from index 2 to 4 are 2 + 3 + 7 = 12.' },
      { input: 'arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], target = 15', output: '[1, 5]', explanation: '1 + 2 + 3 + 4 + 5 = 15.' }
    ],
    constraints: ['1 <= arr.length <= 10^5', '0 <= arr[i] <= 10^9', '0 <= target <= 10^9'],
    starter_code: {
      python: `def subarraySum(arr, target):\n    # Write your solution here\n    # Return [start_idx, end_idx] (1-based), or [-1]\n    left = 0\n    curr_sum = 0\n    for right in range(len(arr)):\n        curr_sum += arr[right]\n        while curr_sum > target and left < right:\n            curr_sum -= arr[left]\n            left += 1\n        if curr_sum == target:\n            return [left + 1, right + 1]\n    return [-1]\n`,
      javascript: `function subarraySum(arr, target) {\n    // Write your solution here\n    let left = 0;\n    let curr_sum = 0;\n    for (let right = 0; right < arr.length; right++) {\n        curr_sum += arr[right];\n        while (curr_sum > target && left < right) {\n            curr_sum -= arr[left];\n            left++;\n        }\n        if (curr_sum === target) {\n            return [left + 1, right + 1];\n        }\n    }\n    return [-1];\n}\n`,
      cpp: `// C++ 17 Solution\n#include <vector>\nusing namespace std;\n\nvector<int> subarraySum(vector<int>& arr, int target) {\n    int left = 0, curr_sum = 0;\n    for (int right = 0; right < arr.size(); right++) {\n        curr_sum += arr[right];\n        while (curr_sum > target && left < right) {\n            curr_sum -= arr[left++];\n        }\n        if (curr_sum == target) return {left + 1, right + 1};\n    }\n    return {-1};\n}`,
      java: `// Java 17 Solution\nimport java.util.*;\n\nclass Solution {\n    public static List<Integer> subarraySum(int[] arr, int target) {\n        int left = 0, curr_sum = 0;\n        for (int right = 0; right < arr.length; right++) {\n            curr_sum += arr[right];\n            while (curr_sum > target && left < right) {\n                curr_sum -= arr[left++];\n            }\n            if (curr_sum == target) return Arrays.asList(left + 1, right + 1);\n        }\n        return Arrays.asList(-1);\n    }\n}`
    },
    test_cases: [
      { args: [[1, 2, 3, 7, 5], 12], expected: [2, 4], is_sample: true },
      { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 15], expected: [1, 5], is_sample: true },
      { args: [[7, 2, 1], 2], expected: [2, 2], is_sample: false },
      { args: [[5, 3, 4], 2], expected: [-1], is_sample: false }
    ],
    entry_point: 'subarraySum',
    discussions: [
      {
        id: 'disc-1',
        author: 'Arjun Verma',
        avatar: 'AV',
        role: 'Amazon SDE-1',
        time: '2 days ago',
        upvotes: 42,
        title: 'Sliding window caveat with target = 0 or empty intervals',
        content: 'Be careful! If the array contains zeros or if target is 0, the condition `left < right` needs slight care. Since all numbers are non-negative, the two-pointer approach is strictly O(N) because left and right each move forward at most N times.'
      },
      {
        id: 'disc-2',
        author: 'Priya Sundaram',
        avatar: 'PS',
        role: 'Flipkart SDE-2',
        time: '1 week ago',
        upvotes: 28,
        title: 'Prefix Sum + Hash Map for Negative Numbers',
        content: 'If the interviewer asks: "What if the array has negative numbers?", the sliding window fails because the window sum is no longer monotonic. You must transition to a Prefix Sum with a Hash Map storing `curr_sum - target` in O(N) time and O(N) space.'
      }
    ],
    editorial: {
      approach: 'Sliding Window (Two Pointers)',
      explanation: 'Maintain two pointers `left` and `right`. Expand `right` to increase the running sum. If the sum exceeds `target`, advance `left` to shrink the window. Since both pointers move at most N times, the algorithm runs in strictly O(N) time and O(1) auxiliary space.',
      python_solution: `def subarraySum(arr, target):\n    left = 0\n    curr = 0\n    for right in range(len(arr)):\n        curr += arr[right]\n        while curr > target and left < right:\n            curr -= arr[left]\n            left += 1\n        if curr == target:\n            return [left + 1, right + 1]\n    return [-1]`,
      javascript_solution: `function subarraySum(arr, target) {\n    let left = 0, curr = 0;\n    for (let right = 0; right < arr.length; right++) {\n        curr += arr[right];\n        while (curr > target && left < right) {\n            curr -= arr[left++];\n        }\n        if (curr === target) return [left + 1, right + 1];\n    }\n    return [-1];\n}`,
      cpp_solution: `vector<int> subarraySum(vector<int>& arr, int target) {\n    int left = 0, curr = 0;\n    for (int right = 0; right < arr.size(); right++) {\n        curr += arr[right];\n        while (curr > target && left < right) curr -= arr[left++];\n        if (curr == target) return {left + 1, right + 1};\n    }\n    return {-1};\n}`,
      java_solution: `public static List<Integer> subarraySum(int[] arr, int target) {\n    int left = 0, curr = 0;\n    for (int right = 0; right < arr.length; right++) {\n        curr += arr[right];\n        while (curr > target && left < right) curr -= arr[left++];\n        if (curr == target) return Arrays.asList(left + 1, right + 1);\n    }\n    return Arrays.asList(-1);\n}`
    }
  },
  {
    slug: 'parenthesis-checker',
    title: 'Parenthesis Checker (Valid Parentheses)',
    difficulty: 'Easy',
    category: 'Stack & Queue',
    companies: ['Google', 'Amazon', 'Flipkart', 'Adobe', 'Microsoft'],
    accuracy: '54.2%',
    points: 3,
    time_complexity: 'O(N)',
    space_complexity: 'O(N)',
    hints: [
      'Think about using a Stack (LIFO) data structure.',
      'Push opening brackets onto the stack. When encountering a closing bracket, verify if the top of the stack has the matching opener.',
      'At the end of the string, the stack must be completely empty.'
    ],
    description: `Given an expression string x containing brackets '{', '}', '(', ')', '[', ']', verify whether the brackets are balanced and return true or false.`,
    examples: [
      { input: 'x = "[()]{}{[()()]()}"', output: 'true', explanation: 'All opening and closing brackets match correctly in order.' },
      { input: 'x = "[(])"', output: 'false', explanation: 'Brackets intersect invalidly.' }
    ],
    constraints: ['1 <= x.length <= 10^5'],
    starter_code: {
      python: `def isPar(x):\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in x:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return len(stack) == 0\n`,
      javascript: `function isPar(x) {\n    const stack = [];\n    const mapping = { ")": "(", "}": "{", "]": "[" };\n    for (let char of x) {\n        if (mapping[char]) {\n            const top = stack.length > 0 ? stack.pop() : "#";\n            if (mapping[char] !== top) return false;\n        } else {\n            stack.push(char);\n        }\n    }\n    return stack.length === 0;\n}\n`,
      cpp: `// C++ 17 Solution\n#include <string>\n#include <stack>\nusing namespace std;\n\nbool isPar(string x) {\n    stack<char> st;\n    for (char c : x) {\n        if (c == '(' || c == '{' || c == '[') st.push(c);\n        else {\n            if (st.empty()) return false;\n            char top = st.top(); st.pop();\n            if (c == ')' && top != '(') return false;\n            if (c == '}' && top != '{') return false;\n            if (c == ']' && top != '[') return false;\n        }\n    }\n    return st.empty();\n}`,
      java: `// Java 17 Solution\nimport java.util.*;\n\nclass Solution {\n    public static boolean isPar(String x) {\n        Stack<Character> st = new Stack<>();\n        for (char c : x.toCharArray()) {\n            if (c == '(' || c == '{' || c == '[') st.push(c);\n            else {\n                if (st.isEmpty()) return false;\n                char top = st.pop();\n                if (c == ')' && top != '(') return false;\n                if (c == '}' && top != '{') return false;\n                if (c == ']' && top != '[') return false;\n            }\n        }\n        return st.isEmpty();\n    }\n}`
    },
    test_cases: [
      { args: ["[()]{}{[()()]()}"], expected: true, is_sample: true },
      { args: ["[(])"], expected: false, is_sample: true },
      { args: ["{()}"], expected: true, is_sample: false },
      { args: ["("], expected: false, is_sample: false }
    ],
    entry_point: 'isPar',
    discussions: [
      {
        id: 'disc-par-1',
        author: 'Rohan Mehra',
        avatar: 'RM',
        role: 'Microsoft SDE-1',
        time: '3 days ago',
        upvotes: 35,
        title: 'Early Exit Check: Odd Length Strings',
        content: 'Pro tip for interview speed: if `len(x) % 2 != 0`, immediately return False! Brackets must exist in pairs, so any odd length string can never be balanced.'
      }
    ],
    editorial: {
      approach: 'Stack Matching',
      explanation: 'Use a stack to track open brackets. Whenever a closing bracket appears, check if it matches the most recent opening bracket popped from the stack.',
      python_solution: `def isPar(x):\n    stack = []\n    pairs = {')': '(', '}': '{', ']': '['}\n    for ch in x:\n        if ch in pairs:\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n        else:\n            stack.append(ch)\n    return not stack`,
      javascript_solution: `function isPar(x) {\n    const stack = [];\n    const pairs = { ')': '(', '}': '{', ']': '[' };\n    for (const ch of x) {\n        if (pairs[ch]) {\n            if (!stack.length || stack.pop() !== pairs[ch]) return false;\n        } else {\n            stack.push(ch);\n        }\n    }\n    return stack.length === 0;\n}`,
      cpp_solution: `bool isPar(string x) {\n    stack<char> s;\n    for (char c : x) {\n        if (c == '(' || c == '{' || c == '[') s.push(c);\n        else {\n            if (s.empty()) return false;\n            char top = s.top(); s.pop();\n            if (c == ')' && top != '(') return false;\n            if (c == '}' && top != '{') return false;\n            if (c == ']' && top != '[') return false;\n        }\n    }\n    return s.empty();\n}`,
      java_solution: `public static boolean isPar(String x) {\n    Stack<Character> s = new Stack<>();\n    for (char c : x.toCharArray()) {\n        if (c == '(' || c == '{' || c == '[') s.push(c);\n        else {\n            if (s.isEmpty()) return false;\n            char top = s.pop();\n            if (c == ')' && top != '(') return false;\n            if (c == '}' && top != '{') return false;\n            if (c == ']' && top != '[') return false;\n        }\n    }\n    return s.isEmpty();\n}`
    }
  },
  {
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    accuracy: '49.2%',
    points: 3,
    time_complexity: 'O(N)',
    space_complexity: 'O(N)',
    hints: [
      'A brute force solution takes O(N^2) checking every pair.',
      'Can you store visited values in a Hash Map to check target - num in O(1)?',
      'Track indices as map values.'
    ],
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input has exactly one solution.`,
    examples: [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'nums[0] + nums[1] == 9, so we return [0, 1].' },
      { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]', explanation: 'nums[1] + nums[2] == 6.' }
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    starter_code: {
      python: `def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []\n`,
      javascript: `function twoSum(nums, target) {\n    const seen = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (seen.has(diff)) {\n            return [seen.get(diff), i];\n        }\n        seen.set(nums[i], i);\n    }\n    return [];\n}\n`,
      cpp: `// C++ 17 Solution\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> seen;\n    for (int i = 0; i < nums.size(); i++) {\n        int diff = target - nums[i];\n        if (seen.count(diff)) return {seen[diff], i};\n        seen[nums[i]] = i;\n    }\n    return {};\n}`,
      java: `// Java 17 Solution\nimport java.util.*;\n\nclass Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (seen.containsKey(diff)) return new int[]{seen.get(diff), i};\n            seen.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`
    },
    test_cases: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1], is_sample: true },
      { args: [[3, 2, 4], 6], expected: [1, 2], is_sample: true },
      { args: [[3, 3], 6], expected: [0, 1], is_sample: false },
      { args: [[1, 5, 8, 12, 19], 20], expected: [0, 4], is_sample: false }
    ],
    entry_point: 'twoSum',
    discussions: [
      {
        id: 'disc-2sum-1',
        author: 'Ananya Sharma',
        avatar: 'AS',
        role: 'Google SWE-III',
        time: '5 days ago',
        upvotes: 61,
        title: 'Single-pass vs Two-pass Hash Map',
        content: 'Always use the single-pass hash map approach shown in the editorial. Storing elements as you iterate naturally prevents using the same element twice (e.g. target = 6, element is 3).'
      }
    ],
    editorial: {
      approach: 'Hash Map Lookup',
      explanation: 'Maintain a hash map of visited numbers and their indices. For each number, compute target - num. If it exists in the map, return the pair.',
      python_solution: `def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []`,
      javascript_solution: `function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        if (map.has(target - nums[i])) {\n            return [map.get(target - nums[i]), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
      cpp_solution: `vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> mp;\n    for (int i = 0; i < nums.size(); i++) {\n        if (mp.count(target - nums[i])) return {mp[target - nums[i]], i};\n        mp[nums[i]] = i;\n    }\n    return {};\n}`,
      java_solution: `public static int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        if (map.containsKey(target - nums[i])) return new int[]{map.get(target - nums[i]), i};\n        map.put(nums[i], i);\n    }\n    return new int[]{};\n}`
    }
  },
  {
    slug: 'kadanes-algorithm',
    title: "Kadane's Algorithm (Max Subarray Sum)",
    difficulty: 'Medium',
    category: 'Arrays',
    companies: ['Amazon', 'Google', 'Microsoft', 'Flipkart'],
    accuracy: '51.3%',
    points: 4,
    time_complexity: 'O(N)',
    space_complexity: 'O(1)',
    hints: [
      'At each index, decide whether to append nums[i] to the existing running subarray or start fresh from nums[i].',
      'Maintain running max_so_far and curr_sum.',
      'Initialize with nums[0] to handle negative arrays properly.'
    ],
    description: `Given an integer array nums, find the contiguous subarray with the largest sum and return its sum.`,
    examples: [
      { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6', explanation: 'Subarray [4, -1, 2, 1] has the largest sum = 6.' },
      { input: 'nums = [1]', output: '1', explanation: 'Single element is the largest subarray sum.' }
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    starter_code: {
      python: `def maxSubArray(nums):\n    max_so_far = nums[0]\n    curr = nums[0]\n    for i in range(1, len(nums)):\n        curr = max(nums[i], curr + nums[i])\n        max_so_far = max(max_so_far, curr)\n    return max_so_far\n`,
      javascript: `function maxSubArray(nums) {\n    let max_so_far = nums[0];\n    let curr = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        curr = Math.max(nums[i], curr + nums[i]);\n        max_so_far = Math.max(max_so_far, curr);\n    }\n    return max_so_far;\n}\n`,
      cpp: `// C++ 17 Solution\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint maxSubArray(vector<int>& nums) {\n    int max_so_far = nums[0], curr = nums[0];\n    for (int i = 1; i < nums.size(); i++) {\n        curr = max(nums[i], curr + nums[i]);\n        max_so_far = max(max_so_far, curr);\n    }\n    return max_so_far;\n}`,
      java: `// Java 17 Solution\nclass Solution {\n    public static int maxSubArray(int[] nums) {\n        int maxSoFar = nums[0], curr = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            curr = Math.max(nums[i], curr + nums[i]);\n            maxSoFar = Math.max(maxSoFar, curr);\n        }\n        return maxSoFar;\n    }\n}`
    },
    test_cases: [
      { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6, is_sample: true },
      { args: [[1]], expected: 1, is_sample: true },
      { args: [[5, 4, -1, 7, 8]], expected: 23, is_sample: false },
      { args: [[-5, -2, -8, -1]], expected: -1, is_sample: false }
    ],
    entry_point: 'maxSubArray',
    discussions: [
      {
        id: 'disc-kadane-1',
        author: 'Vikram Seth',
        avatar: 'VS',
        role: 'Adobe SDE-2',
        time: '4 days ago',
        upvotes: 49,
        title: 'How to return the actual subarray indices?',
        content: 'To return the indices [start, end] rather than just the maximum sum, record `temp_start = i` whenever `nums[i] > curr + nums[i]`, and update `best_start = temp_start, best_end = i` whenever `curr > max_so_far`.'
      }
    ],
    editorial: {
      approach: "Kadane's Dynamic Programming",
      explanation: 'At each position i, the max subarray ending at i is max(nums[i], curr + nums[i]). We track the global maximum continuously in O(N) time.',
      python_solution: `def maxSubArray(nums):\n    max_val = nums[0]\n    curr = nums[0]\n    for x in nums[1:]:\n        curr = max(x, curr + x)\n        max_val = max(max_val, curr)\n    return max_val`,
      javascript_solution: `function maxSubArray(nums) {\n    let maxVal = nums[0], curr = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        curr = Math.max(nums[i], curr + nums[i]);\n        maxVal = Math.max(maxVal, curr);\n    }\n    return maxVal;\n}`,
      cpp_solution: `int maxSubArray(vector<int>& nums) {\n    int res = nums[0], curr = nums[0];\n    for (int i = 1; i < nums.size(); i++) {\n        curr = max(nums[i], curr + nums[i]);\n        res = max(res, curr);\n    }\n    return res;\n}`,
      java_solution: `public static int maxSubArray(int[] nums) {\n    int res = nums[0], curr = nums[0];\n    for (int i = 1; i < nums.length; i++) {\n        curr = Math.max(nums[i], curr + nums[i]);\n        res = Math.max(res, curr);\n    }\n    return res;\n}`
    }
  },
  {
    slug: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    category: 'Arrays',
    companies: ['Google', 'Amazon', 'Microsoft', 'Apple', 'Meta'],
    accuracy: '41.5%',
    points: 8,
    time_complexity: 'O(N)',
    space_complexity: 'O(1)',
    hints: [
      'The water trapped above bar i is min(max_left, max_right) - height[i].',
      'Instead of prefix/suffix arrays requiring O(N) memory, maintain two pointers left and right.',
      'Always advance the pointer with the smaller boundary.'
    ],
    description: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.`,
    examples: [
      { input: 'height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]', output: '6', explanation: 'The elevation map traps 6 units of rain water.' },
      { input: 'height = [4, 2, 0, 3, 2, 5]', output: '9', explanation: 'Traps 9 units of rain water.' }
    ],
    constraints: ['1 <= height.length <= 10^5', '0 <= height[i] <= 10^5'],
    starter_code: {
      python: `def trap(height):\n    if not height: return 0\n    left, right = 0, len(height) - 1\n    max_left, max_right = height[left], height[right]\n    water = 0\n    while left < right:\n        if max_left < max_right:\n            left += 1\n            max_left = max(max_left, height[left])\n            water += max_left - height[left]\n        else:\n            right -= 1\n            max_right = max(max_right, height[right])\n            water += max_right - height[right]\n    return water\n`,
      javascript: `function trap(height) {\n    if (!height.length) return 0;\n    let left = 0, right = height.length - 1;\n    let max_left = height[left], max_right = height[right];\n    let water = 0;\n    while (left < right) {\n        if (max_left < max_right) {\n            left++;\n            max_left = Math.max(max_left, height[left]);\n            water += max_left - height[left];\n        } else {\n            right--;\n            max_right = Math.max(max_right, height[right]);\n            water += max_right - height[right];\n        }\n    }\n    return water;\n}\n`,
      cpp: `// C++ 17 Solution\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint trap(vector<int>& height) {\n    if (height.empty()) return 0;\n    int left = 0, right = height.size() - 1;\n    int max_left = height[left], max_right = height[right];\n    int water = 0;\n    while (left < right) {\n        if (max_left < max_right) {\n            left++;\n            max_left = max(max_left, height[left]);\n            water += max_left - height[left];\n        } else {\n            right--;\n            max_right = max(max_right, height[right]);\n            water += max_right - height[right];\n        }\n    }\n    return water;\n}`,
      java: `// Java 17 Solution\nclass Solution {\n    public static int trap(int[] height) {\n        if (height.length == 0) return 0;\n        int left = 0, right = height.length - 1;\n        int maxLeft = height[left], maxRight = height[right];\n        int water = 0;\n        while (left < right) {\n            if (maxLeft < maxRight) {\n                left++;\n                maxLeft = Math.max(maxLeft, height[left]);\n                water += maxLeft - height[left];\n            } else {\n                right--;\n                maxRight = Math.max(maxRight, height[right]);\n                water += maxRight - height[right];\n            }\n        }\n        return water;\n    }\n}`
    },
    test_cases: [
      { args: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6, is_sample: true },
      { args: [[4, 2, 0, 3, 2, 5]], expected: 9, is_sample: true },
      { args: [[1, 2, 3]], expected: 0, is_sample: false },
      { args: [[3, 0, 2, 0, 4]], expected: 7, is_sample: false }
    ],
    entry_point: 'trap',
    discussions: [
      {
        id: 'disc-trap-1',
        author: 'Sameer Sen',
        avatar: 'SS',
        role: 'Google Staff Engineer',
        time: '6 days ago',
        upvotes: 74,
        title: 'Two Pointers vs Monotonic Stack',
        content: 'While two pointers gives clean O(1) space, interviewers also love seeing the Monotonic Decreasing Stack approach because it mirrors the horizontal bar filling technique used in Largest Rectangle in Histogram.'
      }
    ],
    editorial: {
      approach: 'Two Pointers (O(1) Space)',
      explanation: 'Use two pointers from both ends. Whichever side has a smaller boundary acts as the bottleneck for that cell, guaranteeing we can compute the water volume immediately.',
      python_solution: `def trap(height):\n    if not height: return 0\n    l, r = 0, len(height) - 1\n    ml, mr = height[l], height[r]\n    ans = 0\n    while l < r:\n        if ml < mr:\n            l += 1\n            ml = max(ml, height[l])\n            ans += ml - height[l]\n        else:\n            r -= 1\n            mr = max(mr, height[r])\n            ans += mr - height[r]\n    return ans`,
      javascript_solution: `function trap(height) {\n    let l = 0, r = height.length - 1;\n    let ml = height[l], mr = height[r], ans = 0;\n    while (l < r) {\n        if (ml < mr) {\n            l++;\n            ml = Math.max(ml, height[l]);\n            ans += ml - height[l];\n        } else {\n            r--;\n            mr = Math.max(mr, height[r]);\n            ans += mr - height[r];\n        }\n    }\n    return ans;\n}`,
      cpp_solution: `int trap(vector<int>& height) {\n    int l = 0, r = height.size() - 1, ml = height[l], mr = height[r], ans = 0;\n    while (l < r) {\n        if (ml < mr) {\n            l++;\n            ml = max(ml, height[l]);\n            ans += ml - height[l];\n        } else {\n            r--;\n            mr = max(mr, height[r]);\n            ans += mr - height[r];\n        }\n    }\n    return ans;\n}`,
      java_solution: `public static int trap(int[] height) {\n    int l = 0, r = height.length - 1, ml = height[l], mr = height[r], ans = 0;\n    while (l < r) {\n        if (ml < mr) {\n            l++;\n            ml = Math.max(ml, height[l]);\n            ans += ml - height[l];\n        } else {\n            r--;\n            mr = Math.max(mr, height[r]);\n            ans += mr - height[r];\n        }\n    }\n    return ans;\n}`
    }
  },
  {
    slug: 'next-greater-element',
    title: 'Next Greater Element',
    difficulty: 'Medium',
    category: 'Stack & Queue',
    companies: ['Amazon', 'Flipkart', 'Microsoft'],
    accuracy: '47.1%',
    points: 4,
    time_complexity: 'O(N)',
    space_complexity: 'O(N)',
    hints: [
      'Iterate backwards from the rightmost element.',
      'Maintain a monotonic decreasing stack of candidates.',
      'Pop elements smaller than or equal to current element. If stack is empty, answer is -1.'
    ],
    description: `Given an array arr of size n, find the next greater element for each element of the array in order of their appearance. If no greater element exists, output -1.`,
    examples: [
      { input: 'arr = [1, 3, 2, 4]', output: '[3, 4, 4, -1]', explanation: 'Next greater for 1 is 3, for 3 is 4, for 2 is 4, for 4 is -1.' },
      { input: 'arr = [6, 8, 0, 1, 3]', output: '[8, -1, 1, 3, -1]', explanation: 'Next greater for each element.' }
    ],
    constraints: ['1 <= arr.length <= 10^5', '0 <= arr[i] <= 10^9'],
    starter_code: {
      python: `def nextLargerElement(arr):\n    n = len(arr)\n    res = [-1] * n\n    stack = []\n    for i in range(n - 1, -1, -1):\n        while stack and stack[-1] <= arr[i]:\n            stack.pop()\n        if stack:\n            res[i] = stack[-1]\n        stack.append(arr[i])\n    return res\n`,
      javascript: `function nextLargerElement(arr) {\n    const n = arr.length;\n    const res = new Array(n).fill(-1);\n    const stack = [];\n    for (let i = n - 1; i >= 0; i--) {\n        while (stack.length && stack[stack.length - 1] <= arr[i]) {\n            stack.pop();\n        }\n        if (stack.length) {\n            res[i] = stack[stack.length - 1];\n        }\n        stack.push(arr[i]);\n    }\n    return res;\n}\n`,
      cpp: `// C++ 17 Solution\n#include <vector>\n#include <stack>\nusing namespace std;\n\nvector<long long> nextLargerElement(vector<long long>& arr) {\n    int n = arr.size();\n    vector<long long> res(n, -1);\n    stack<long long> st;\n    for (int i = n - 1; i >= 0; i--) {\n        while (!st.empty() && st.top() <= arr[i]) st.pop();\n        if (!st.empty()) res[i] = st.top();\n        st.push(arr[i]);\n    }\n    return res;\n}`,
      java: `// Java 17 Solution\nimport java.util.*;\n\nclass Solution {\n    public static long[] nextLargerElement(long[] arr) {\n        int n = arr.length;\n        long[] res = new long[n];\n        Arrays.fill(res, -1);\n        Stack<Long> st = new Stack<>();\n        for (int i = n - 1; i >= 0; i--) {\n            while (!st.isEmpty() && st.peek() <= arr[i]) st.pop();\n            if (!st.isEmpty()) res[i] = st.peek();\n            st.push(arr[i]);\n        }\n        return res;\n    }\n}`
    },
    test_cases: [
      { args: [[1, 3, 2, 4]], expected: [3, 4, 4, -1], is_sample: true },
      { args: [[6, 8, 0, 1, 3]], expected: [8, -1, 1, 3, -1], is_sample: true },
      { args: [[10, 20, 30, 50]], expected: [20, 30, 50, -1], is_sample: false },
      { args: [[50, 40, 30]], expected: [-1, -1, -1], is_sample: false }
    ],
    entry_point: 'nextLargerElement',
    discussions: [
      {
        id: 'disc-nge-1',
        author: 'Kavita Nair',
        avatar: 'KN',
        role: 'Amazon SDE-2',
        time: '3 days ago',
        upvotes: 31,
        title: 'Iterating right-to-left vs left-to-right with index stack',
        content: 'Both right-to-left and left-to-right (storing indices) take O(N). Right-to-left is usually easier to read in an interview setting because you populate the result array directly!'
      }
    ],
    editorial: {
      approach: 'Monotonic Stack (Right-to-Left)',
      explanation: 'Traversing backwards, maintain a stack of values. Any value smaller than arr[i] cannot be the next greater element for any future element to the left of i, so we pop it.',
      python_solution: `def nextLargerElement(arr):\n    n = len(arr)\n    res = [-1] * n\n    st = []\n    for i in range(n - 1, -1, -1):\n        while st and st[-1] <= arr[i]: st.pop()\n        if st: res[i] = st[-1]\n        st.append(arr[i])\n    return res`,
      javascript_solution: `function nextLargerElement(arr) {\n    const n = arr.length, res = new Array(n).fill(-1), st = [];\n    for (let i = n - 1; i >= 0; i--) {\n        while (st.length && st[st.length - 1] <= arr[i]) st.pop();\n        if (st.length) res[i] = st[st.length - 1];\n        st.push(arr[i]);\n    }\n    return res;\n}`,
      cpp_solution: `vector<long long> nextLargerElement(vector<long long>& arr) {\n    int n = arr.size();\n    vector<long long> res(n, -1);\n    stack<long long> st;\n    for (int i = n - 1; i >= 0; i--) {\n        while (!st.empty() && st.top() <= arr[i]) st.pop();\n        if (!st.empty()) res[i] = st.top();\n        st.push(arr[i]);\n    }\n    return res;\n}`,
      java_solution: `public static long[] nextLargerElement(long[] arr) {\n    int n = arr.length;\n    long[] res = new long[n];\n    Arrays.fill(res, -1);\n    Stack<Long> st = new Stack<>();\n    for (int i = n - 1; i >= 0; i--) {\n        while (!st.isEmpty() && st.peek() <= arr[i]) st.pop();\n        if (!st.isEmpty()) res[i] = st.peek();\n        st.push(arr[i]);\n    }\n    return res;\n}`
    }
  },
  {
    slug: 'reverse-words-in-string',
    title: 'Reverse Words in a String',
    difficulty: 'Medium',
    category: 'Strings',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'Paytm'],
    accuracy: '58.4%',
    points: 4,
    time_complexity: 'O(N)',
    space_complexity: 'O(N)',
    hints: [
      'Split by spaces while stripping redundant whitespace.',
      'Reverse the extracted list of tokens.',
      'Join tokens with a single space.'
    ],
    description: `Given a string s, reverse the order of the words. Return a string of the words in reverse order concatenated by a single space, removing leading, trailing, and multiple intervening spaces.`,
    examples: [
      { input: 's = "the sky is blue"', output: '"blue is sky the"', explanation: 'Words reversed in order.' },
      { input: 's = "  hello world  "', output: '"world hello"', explanation: 'Extra spaces removed.' }
    ],
    constraints: ['1 <= s.length <= 10^5'],
    starter_code: {
      python: `def reverseWords(s):\n    words = [w for w in s.strip().split() if w]\n    return " ".join(reversed(words))\n`,
      javascript: `function reverseWords(s) {\n    return s.trim().split(/\\s+/).reverse().join(" ");\n}\n`,
      cpp: `// C++ 17 Solution\n#include <string>\n#include <sstream>\n#include <vector>\nusing namespace std;\n\nstring reverseWords(string s) {\n    stringstream ss(s);\n    string word;\n    vector<string> words;\n    while (ss >> word) words.push_back(word);\n    string res = "";\n    for (int i = (int)words.size() - 1; i >= 0; i--) {\n        res += words[i];\n        if (i > 0) res += " ";\n    }\n    return res;\n}`,
      java: `// Java 17 Solution\nclass Solution {\n    public static String reverseWords(String s) {\n        String[] parts = s.trim().split("\\\\s+");\n        StringBuilder sb = new StringBuilder();\n        for (int i = parts.length - 1; i >= 0; i--) {\n            sb.append(parts[i]);\n            if (i > 0) sb.append(" ");\n        }\n        return sb.toString();\n    }\n}`
    },
    test_cases: [
      { args: ["the sky is blue"], expected: "blue is sky the", is_sample: true },
      { args: ["  hello world  "], expected: "world hello", is_sample: true },
      { args: ["a good   example"], expected: "example good a", is_sample: false },
      { args: ["EPIC"], expected: "EPIC", is_sample: false }
    ],
    entry_point: 'reverseWords',
    discussions: [
      {
        id: 'disc-rw-1',
        author: 'Harish Goel',
        avatar: 'HG',
        role: 'Microsoft SDE-1',
        time: '1 week ago',
        upvotes: 24,
        title: 'In-place reversal with O(1) space in C++',
        content: 'In languages with mutable strings like C++, you can achieve true O(1) auxiliary space: first reverse the entire string, then iterate and reverse each individual word back!'
      }
    ],
    editorial: {
      approach: 'Token Split and Reverse',
      explanation: 'Tokenize the string into valid non-empty words ignoring variable whitespace, then concatenate them in reverse order.',
      python_solution: `def reverseWords(s):\n    return " ".join(s.strip().split()[::-1])`,
      javascript_solution: `function reverseWords(s) {\n    return s.trim().split(/\\s+/).reverse().join(" ");\n}`,
      cpp_solution: `string reverseWords(string s) {\n    stringstream ss(s);\n    string word, res = "";\n    vector<string> v;\n    while (ss >> word) v.push_back(word);\n    for (int i = (int)v.size() - 1; i >= 0; i--) {\n        res += v[i] + (i > 0 ? " " : "");\n    }\n    return res;\n}`,
      java_solution: `public static String reverseWords(String s) {\n    String[] words = s.trim().split("\\\\s+");\n    StringBuilder sb = new StringBuilder();\n    for (int i = words.length - 1; i >= 0; i--) {\n        sb.append(words[i]).append(i > 0 ? " " : "");\n    }\n    return sb.toString();\n}`
    }
  },
  {
    slug: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    category: 'Searching',
    companies: ['Google', 'Amazon', 'Apple', 'TCS'],
    accuracy: '65.3%',
    points: 3,
    time_complexity: 'O(log N)',
    space_complexity: 'O(1)',
    hints: [
      'Maintain low = 0 and high = len(arr) - 1.',
      'Use mid = low + (high - low) // 2 to avoid integer overflow in other languages.',
      'If target < arr[mid], adjust high = mid - 1; else low = mid + 1.'
    ],
    description: `Given a sorted array of distinct integers arr and a target value, return the 0-based index of target in arr. If target does not exist, return -1.`,
    examples: [
      { input: 'arr = [-1, 0, 3, 5, 9, 12], target = 9', output: '4', explanation: '9 exists at index 4.' },
      { input: 'arr = [-1, 0, 3, 5, 9, 12], target = 2', output: '-1', explanation: '2 does not exist in arr.' }
    ],
    constraints: ['1 <= arr.length <= 10^5', '-10^4 <= arr[i], target <= 10^4'],
    starter_code: {
      python: `def binarysearch(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = low + (high - low) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n`,
      javascript: `function binarysearch(arr, target) {\n    let low = 0, high = arr.length - 1;\n    while (low <= high) {\n        const mid = Math.floor(low + (high - low) / 2);\n        if (arr[mid] === target) return mid;\n        else if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}\n`,
      cpp: `// C++ 17 Solution\n#include <vector>\nusing namespace std;\n\nint binarysearch(vector<int>& arr, int target) {\n    int low = 0, high = arr.size() - 1;\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (arr[mid] == target) return mid;\n        else if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}`,
      java: `// Java 17 Solution\nclass Solution {\n    public static int binarysearch(int[] arr, int target) {\n        int low = 0, high = arr.length - 1;\n        while (low <= high) {\n            int mid = low + (high - low) / 2;\n            if (arr[mid] == target) return mid;\n            else if (arr[mid] < target) low = mid + 1;\n            else high = mid - 1;\n        }\n        return -1;\n    }\n}`
    },
    test_cases: [
      { args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4, is_sample: true },
      { args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1, is_sample: true },
      { args: [[5], 5], expected: 0, is_sample: false },
      { args: [[2, 5], 5], expected: 1, is_sample: false }
    ],
    entry_point: 'binarysearch',
    discussions: [
      {
        id: 'disc-bs-1',
        author: 'Deepak Joshi',
        avatar: 'DJ',
        role: 'Apple SWE',
        time: '4 days ago',
        upvotes: 38,
        title: 'Why low + (high - low) / 2 matters',
        content: 'In Java/C++, `(low + high) / 2` can overflow integer bounds if low and high exceed 2^30 - 1. Writing `low + (high - low) / 2` is universally safe.'
      }
    ],
    editorial: {
      approach: 'Divide and Conquer Binary Search',
      explanation: 'Halve the search space at every step by checking the middle element. Runs in O(log N) time with O(1) space.',
      python_solution: `def binarysearch(arr, target):\n    l, r = 0, len(arr) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if arr[m] == target: return m\n        elif arr[m] < target: l = m + 1\n        else: r = m - 1\n    return -1`,
      javascript_solution: `function binarysearch(arr, target) {\n    let l = 0, r = arr.length - 1;\n    while (l <= r) {\n        const m = Math.floor((l + r) / 2);\n        if (arr[m] === target) return m;\n        else if (arr[m] < target) l = m + 1;\n        else r = m - 1;\n    }\n    return -1;\n}`,
      cpp_solution: `int binarysearch(vector<int>& arr, int target) {\n    int l = 0, r = arr.size() - 1;\n    while (l <= r) {\n        int m = l + (r - l) / 2;\n        if (arr[m] == target) return m;\n        if (arr[m] < target) l = m + 1;\n        else r = m - 1;\n    }\n    return -1;\n}`,
      java_solution: `public static int binarysearch(int[] arr, int target) {\n    int l = 0, r = arr.length - 1;\n    while (l <= r) {\n        int m = l + (r - l) / 2;\n        if (arr[m] == target) return m;\n        if (arr[m] < target) l = m + 1;\n        else r = m - 1;\n    }\n    return -1;\n}`
    }
  },
  {
    slug: '01-knapsack-problem',
    title: '0/1 Knapsack Problem',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    companies: ['Amazon', 'Google', 'Flipkart', 'Paytm', 'Microsoft'],
    accuracy: '42.9%',
    points: 6,
    time_complexity: 'O(N * W)',
    space_complexity: 'O(W)',
    hints: [
      'Each item can either be included or excluded.',
      'For each item, if weight[i] <= w, dp[w] = max(dp[w], value[i] + dp[w - weight[i]]).',
      'Iterate backwards over weight w from W down to weight[i] for 1D space optimization.'
    ],
    description: `Given weights and values of n items, put these items in a knapsack of capacity W to get the maximum total value in the knapsack. Note that items cannot be broken (0-1 property).`,
    examples: [
      { input: 'W = 4, val = [1, 2, 3], wt = [4, 5, 1]', output: '3', explanation: 'Take item with wt=1, val=3.' },
      { input: 'W = 3, val = [1, 2, 3], wt = [1, 2, 3]', output: '3', explanation: 'Max value is 3.' }
    ],
    constraints: ['1 <= n <= 1000', '1 <= W <= 1000'],
    starter_code: {
      python: `def knapSack(W, wt, val):\n    n = len(val)\n    dp = [0] * (W + 1)\n    for i in range(n):\n        for w in range(W, wt[i] - 1, -1):\n            dp[w] = max(dp[w], val[i] + dp[w - wt[i]])\n    return dp[W]\n`,
      javascript: `function knapSack(W, wt, val) {\n    const dp = new Array(W + 1).fill(0);\n    for (let i = 0; i < val.length; i++) {\n        for (let w = W; w >= wt[i]; w--) {\n            dp[w] = Math.max(dp[w], val[i] + dp[w - wt[i]]);\n        }\n    }\n    return dp[W];\n}\n`,
      cpp: `// C++ 17 Solution\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint knapSack(int W, vector<int>& wt, vector<int>& val) {\n    vector<int> dp(W + 1, 0);\n    for (int i = 0; i < val.size(); i++) {\n        for (int w = W; w >= wt[i]; w--) {\n            dp[w] = max(dp[w], val[i] + dp[w - wt[i]]);\n        }\n    }\n    return dp[W];\n}`,
      java: `// Java 17 Solution\nclass Solution {\n    public static int knapSack(int W, int[] wt, int[] val) {\n        int[] dp = new int[W + 1];\n        for (int i = 0; i < val.length; i++) {\n            for (int w = W; w >= wt[i]; w--) {\n                dp[w] = Math.max(dp[w], val[i] + dp[w - wt[i]]);\n            }\n        }\n        return dp[W];\n    }\n}`
    },
    test_cases: [
      { args: [4, [4, 5, 1], [1, 2, 3]], expected: 3, is_sample: true },
      { args: [3, [1, 2, 3], [1, 2, 3]], expected: 3, is_sample: true },
      { args: [5, [2, 3, 4], [3, 4, 5]], expected: 7, is_sample: false },
      { args: [10, [5, 4, 6, 3], [10, 40, 30, 50]], expected: 90, is_sample: false }
    ],
    entry_point: 'knapSack',
    discussions: [
      {
        id: 'disc-knap-1',
        author: 'Rohit Kulkarni',
        avatar: 'RK',
        role: 'Flipkart SDE-2',
        time: '2 days ago',
        upvotes: 41,
        title: 'Why backwards loop for 0/1 Knapsack?',
        content: 'Crucial distinction: If you iterate forward from wt[i] to W, you allow multiple uses of the same item (Unbounded Knapsack / Coin Change). Iterating backwards guarantees each item is used at most once!'
      }
    ],
    editorial: {
      approach: '1D Space-Optimized Dynamic Programming',
      explanation: 'Maintain dp[w] representing the max value with capacity w. By iterating capacity w backwards, we avoid overwriting states from the current item.',
      python_solution: `def knapSack(W, wt, val):\n    dp = [0] * (W + 1)\n    for v, w_item in zip(val, wt):\n        for w in range(W, w_item - 1, -1):\n            dp[w] = max(dp[w], v + dp[w - w_item])\n    return dp[W]`,
      javascript_solution: `function knapSack(W, wt, val) {\n    const dp = new Array(W + 1).fill(0);\n    for (let i = 0; i < val.length; i++) {\n        for (let w = W; w >= wt[i]; w--) {\n            dp[w] = Math.max(dp[w], val[i] + dp[w - wt[i]]);\n        }\n    }\n    return dp[W];\n}`,
      cpp_solution: `int knapSack(int W, vector<int>& wt, vector<int>& val) {\n    vector<int> dp(W + 1, 0);\n    for (size_t i = 0; i < val.size(); i++) {\n        for (int w = W; w >= wt[i]; w--) dp[w] = max(dp[w], val[i] + dp[w - wt[i]]);\n    }\n    return dp[W];\n}`,
      java_solution: `public static int knapSack(int W, int[] wt, int[] val) {\n    int[] dp = new int[W + 1];\n    for (int i = 0; i < val.length; i++) {\n        for (int w = W; w >= wt[i]; w--) dp[w] = Math.max(dp[w], val[i] + dp[w - wt[i]]);\n    }\n    return dp[W];\n}`
    }
  },
  {
    slug: 'longest-common-subsequence',
    title: 'Longest Common Subsequence (LCS)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    companies: ['Amazon', 'Microsoft', 'Google', 'Paytm'],
    accuracy: '44.7%',
    points: 5,
    time_complexity: 'O(M * N)',
    space_complexity: 'O(N)',
    hints: [
      'If s1[i-1] == s2[j-1], dp[i][j] = 1 + dp[i-1][j-1].',
      'Otherwise, dp[i][j] = max(dp[i-1][j], dp[i][j-1]).',
      'Can be compressed to two rows of size N + 1.'
    ],
    description: `Given two strings s1 and s2, return the length of their longest common subsequence. If there is no common subsequence, return 0.`,
    examples: [
      { input: 's1 = "ABCDGH", s2 = "AEDFHR"', output: '3', explanation: 'The longest common subsequence is "ADH" of length 3.' },
      { input: 's1 = "ABC", s2 = "AC"', output: '2', explanation: 'The longest common subsequence is "AC" of length 2.' }
    ],
    constraints: ['1 <= s1.length, s2.length <= 1000'],
    starter_code: {
      python: `def lcs(s1, s2):\n    m, n = len(s1), len(s2)\n    dp = [0] * (n + 1)\n    for i in range(1, m + 1):\n        prev = 0\n        for j in range(1, n + 1):\n            temp = dp[j]\n            if s1[i - 1] == s2[j - 1]:\n                dp[j] = 1 + prev\n            else:\n                dp[j] = max(dp[j], dp[j - 1])\n            prev = temp\n    return dp[n]\n`,
      javascript: `function lcs(s1, s2) {\n    const m = s1.length, n = s2.length;\n    const dp = new Array(n + 1).fill(0);\n    for (let i = 1; i <= m; i++) {\n        let prev = 0;\n        for (let j = 1; j <= n; j++) {\n            const temp = dp[j];\n            if (s1[i - 1] === s2[j - 1]) dp[j] = 1 + prev;\n            else dp[j] = Math.max(dp[j], dp[j - 1]);\n            prev = temp;\n        }\n    }\n    return dp[n];\n}\n`,
      cpp: `// C++ 17 Solution\n#include <string>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint lcs(string s1, string s2) {\n    int m = s1.size(), n = s2.size();\n    vector<int> dp(n + 1, 0);\n    for (int i = 1; i <= m; i++) {\n        int prev = 0;\n        for (int j = 1; j <= n; j++) {\n            int temp = dp[j];\n            if (s1[i - 1] == s2[j - 1]) dp[j] = 1 + prev;\n            else dp[j] = max(dp[j], dp[j - 1]);\n            prev = temp;\n        }\n    }\n    return dp[n];\n}`,
      java: `// Java 17 Solution\nclass Solution {\n    public static int lcs(String s1, String s2) {\n        int m = s1.length(), n = s2.length();\n        int[] dp = new int[n + 1];\n        for (int i = 1; i <= m; i++) {\n            int prev = 0;\n            for (int j = 1; j <= n; j++) {\n                int temp = dp[j];\n                if (s1.charAt(i - 1) == s2.charAt(j - 1)) dp[j] = 1 + prev;\n                else dp[j] = Math.max(dp[j], dp[j - 1]);\n                prev = temp;\n            }\n        }\n        return dp[n];\n    }\n}`
    },
    test_cases: [
      { args: ["ABCDGH", "AEDFHR"], expected: 3, is_sample: true },
      { args: ["ABC", "AC"], expected: 2, is_sample: true },
      { args: ["AGGTAB", "GXTXAYB"], expected: 4, is_sample: false },
      { args: ["XYZ", "ABC"], expected: 0, is_sample: false }
    ],
    entry_point: 'lcs',
    discussions: [
      {
        id: 'disc-lcs-1',
        author: 'Tanvi Agarwal',
        avatar: 'TA',
        role: 'Google SWE-II',
        time: '5 days ago',
        upvotes: 33,
        title: 'Building block for Edit Distance and Shortest Common Supersequence',
        content: 'Mastering LCS unlocks 6 other interview questions: Edit Distance, Longest Palindromic Subsequence (LCS of s and s[::-1]), Minimum Insertions to make Palindrome, and Shortest Common Supersequence.'
      }
    ],
    editorial: {
      approach: '2D DP with Space Compression',
      explanation: 'Use dynamic programming comparing characters from both strings. When characters match, extend the diagonal subproblem; otherwise take the maximum of excluding one character from either string.',
      python_solution: `def lcs(s1, s2):\n    m, n = len(s1), len(s2)\n    dp = [0] * (n + 1)\n    for ch1 in s1:\n        prev = 0\n        for j, ch2 in enumerate(s2, 1):\n            temp = dp[j]\n            dp[j] = 1 + prev if ch1 == ch2 else max(dp[j], dp[j - 1])\n            prev = temp\n    return dp[n]`,
      javascript_solution: `function lcs(s1, s2) {\n    const n = s2.length, dp = new Array(n + 1).fill(0);\n    for (const c1 of s1) {\n        let prev = 0;\n        for (let j = 1; j <= n; j++) {\n            const temp = dp[j];\n            dp[j] = (c1 === s2[j - 1]) ? 1 + prev : Math.max(dp[j], dp[j - 1]);\n            prev = temp;\n        }\n    }\n    return dp[n];\n}`,
      cpp_solution: `int lcs(string s1, string s2) {\n    int n = s2.size();\n    vector<int> dp(n + 1, 0);\n    for (char c1 : s1) {\n        int prev = 0;\n        for (int j = 1; j <= n; j++) {\n            int temp = dp[j];\n            dp[j] = (c1 == s2[j - 1]) ? 1 + prev : max(dp[j], dp[j - 1]);\n            prev = temp;\n        }\n    }\n    return dp[n];\n}`,
      java_solution: `public static int lcs(String s1, String s2) {\n    int n = s2.length();\n    int[] dp = new int[n + 1];\n    for (int i = 0; i < s1.length(); i++) {\n        int prev = 0;\n        for (int j = 1; j <= n; j++) {\n            int temp = dp[j];\n            dp[j] = (s1.charAt(i) == s2.charAt(j - 1)) ? 1 + prev : Math.max(dp[j], dp[j - 1]);\n            prev = temp;\n        }\n    }\n    return dp[n];\n}`
    }
  },
  {
    slug: 'coin-change',
    title: 'Coin Change (Min Coins)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft'],
    accuracy: '41.2%',
    points: 5,
    time_complexity: 'O(amount * N)',
    space_complexity: 'O(amount)',
    hints: [
      'Initialize dp array of size amount + 1 with infinity, dp[0] = 0.',
      'For each coin, iterate from coin to amount.',
      'dp[i] = min(dp[i], 1 + dp[i - coin]). If dp[amount] is still infinity, return -1.'
    ],
    description: `You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount cannot be made up by any combination of coins, return -1.`,
    examples: [
      { input: 'coins = [1, 2, 5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1 (3 coins).' },
      { input: 'coins = [2], amount = 3', output: '-1', explanation: 'Cannot make 3 using only 2s.' }
    ],
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
    starter_code: {
      python: `def coinChange(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for coin in coins:\n        for i in range(coin, amount + 1):\n            dp[i] = min(dp[i], 1 + dp[i - coin])\n    return dp[amount] if dp[amount] != float('inf') else -1\n`,
      javascript: `function coinChange(coins, amount) {\n    const dp = new Array(amount + 1).fill(Infinity);\n    dp[0] = 0;\n    for (const coin of coins) {\n        for (let i = coin; i <= amount; i++) {\n            dp[i] = Math.min(dp[i], 1 + dp[i - coin]);\n        }\n    }\n    return dp[amount] === Infinity ? -1 : dp[amount];\n}\n`,
      cpp: `// C++ 17 Solution\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint coinChange(vector<int>& coins, int amount) {\n    vector<int> dp(amount + 1, amount + 1);\n    dp[0] = 0;\n    for (int coin : coins) {\n        for (int i = coin; i <= amount; i++) dp[i] = min(dp[i], 1 + dp[i - coin]);\n    }\n    return dp[amount] > amount ? -1 : dp[amount];\n}`,
      java: `// Java 17 Solution\nimport java.util.*;\n\nclass Solution {\n    public static int coinChange(int[] coins, int amount) {\n        int[] dp = new int[amount + 1];\n        Arrays.fill(dp, amount + 1);\n        dp[0] = 0;\n        for (int coin : coins) {\n            for (int i = coin; i <= amount; i++) dp[i] = Math.min(dp[i], 1 + dp[i - coin]);\n        }\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n}`
    },
    test_cases: [
      { args: [[1, 2, 5], 11], expected: 3, is_sample: true },
      { args: [[2], 3], expected: -1, is_sample: true },
      { args: [[1], 0], expected: 0, is_sample: false },
      { args: [[2, 5, 10, 1], 27], expected: 4, is_sample: false }
    ],
    entry_point: 'coinChange',
    discussions: [
      {
        id: 'disc-coin-1',
        author: 'Sanjay Dutt',
        avatar: 'SD',
        role: 'Meta Senior SWE',
        time: '3 days ago',
        upvotes: 45,
        title: 'Unbounded Knapsack in Action',
        content: 'This is the canonical Unbounded Knapsack problem. Notice the inner loop goes forwards (`for i in range(coin, amount + 1)`), which allows re-using the same coin denomination multiple times.'
      }
    ],
    editorial: {
      approach: 'Bottom-Up Dynamic Programming',
      explanation: 'Define dp[i] as the minimum coins needed for sum i. For each denomination, update reachable sums greedily.',
      python_solution: `def coinChange(coins, amount):\n    dp = [0] + [float('inf')] * amount\n    for c in coins:\n        for i in range(c, amount + 1):\n            dp[i] = min(dp[i], 1 + dp[i - c])\n    return dp[amount] if dp[amount] != float('inf') else -1`,
      javascript_solution: `function coinChange(coins, amount) {\n    const dp = new Array(amount + 1).fill(Infinity);\n    dp[0] = 0;\n    for (const c of coins) {\n        for (let i = c; i <= amount; i++) dp[i] = Math.min(dp[i], 1 + dp[i - c]);\n    }\n    return dp[amount] === Infinity ? -1 : dp[amount];\n}`,
      cpp_solution: `int coinChange(vector<int>& coins, int amount) {\n    vector<int> dp(amount + 1, amount + 1);\n    dp[0] = 0;\n    for (int c : coins) for (int i = c; i <= amount; i++) dp[i] = min(dp[i], 1 + dp[i - c]);\n    return dp[amount] > amount ? -1 : dp[amount];\n}`,
      java_solution: `public static int coinChange(int[] coins, int amount) {\n    int[] dp = new int[amount + 1];\n    Arrays.fill(dp, amount + 1);\n    dp[0] = 0;\n    for (int c : coins) for (int i = c; i <= amount; i++) dp[i] = Math.min(dp[i], 1 + dp[i - c]);\n    return dp[amount] > amount ? -1 : dp[amount];\n}`
    }
  },
  {
    slug: 'word-break',
    title: 'Word Break',
    difficulty: 'Hard',
    category: 'Dynamic Programming',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple'],
    accuracy: '45.1%',
    points: 7,
    time_complexity: 'O(N^2)',
    space_complexity: 'O(N)',
    hints: [
      'Use a boolean dp array where dp[i] is true if s[0:i] can be segmented.',
      'dp[0] is True as an empty string base case.',
      'Check all previous split points j < i where dp[j] is True and s[j:i] in wordSet.'
    ],
    description: `Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.`,
    examples: [
      { input: 's = "leetcode", wordDict = ["leet", "code"]', output: 'true', explanation: 'Return true because "leetcode" can be segmented as "leet code".' },
      { input: 's = "applepenapple", wordDict = ["apple", "pen"]', output: 'true', explanation: 'Can be segmented as "apple pen apple".' }
    ],
    constraints: ['1 <= s.length <= 300', '1 <= wordDict.length <= 1000'],
    starter_code: {
      python: `def wordBreak(s, wordDict):\n    words = set(wordDict)\n    dp = [False] * (len(s) + 1)\n    dp[0] = True\n    for i in range(1, len(s) + 1):\n        for j in range(i):\n            if dp[j] and s[j:i] in words:\n                dp[i] = True\n                break\n    return dp[len(s)]\n`,
      javascript: `function wordBreak(s, wordDict) {\n    const words = new Set(wordDict);\n    const dp = new Array(s.length + 1).fill(false);\n    dp[0] = true;\n    for (let i = 1; i <= s.length; i++) {\n        for (let j = 0; j < i; j++) {\n            if (dp[j] && words.has(s.substring(j, i))) {\n                dp[i] = true;\n                break;\n            }\n        }\n    }\n    return dp[s.length];\n}\n`,
      cpp: `// C++ 17 Solution\n#include <string>\n#include <vector>\n#include <unordered_set>\nusing namespace std;\n\nbool wordBreak(string s, vector<string>& wordDict) {\n    unordered_set<string> dict(wordDict.begin(), wordDict.end());\n    vector<bool> dp(s.size() + 1, false);\n    dp[0] = true;\n    for (int i = 1; i <= s.size(); i++) {\n        for (int j = 0; j < i; j++) {\n            if (dp[j] && dict.count(s.substr(j, i - j))) {\n                dp[i] = true;\n                break;\n            }\n        }\n    }\n    return dp[s.size()];\n}`,
      java: `// Java 17 Solution\nimport java.util.*;\n\nclass Solution {\n    public static boolean wordBreak(String s, List<String> wordDict) {\n        Set<String> dict = new HashSet<>(wordDict);\n        boolean[] dp = new boolean[s.length() + 1];\n        dp[0] = true;\n        for (int i = 1; i <= s.length(); i++) {\n            for (int j = 0; j < i; j++) {\n                if (dp[j] && dict.contains(s.substring(j, i))) {\n                    dp[i] = true;\n                    break;\n                }\n            }\n        }\n        return dp[s.length()];\n    }\n}`
    },
    test_cases: [
      { args: ["leetcode", ["leet", "code"]], expected: true, is_sample: true },
      { args: ["applepenapple", ["apple", "pen"]], expected: true, is_sample: true },
      { args: ["catsandog", ["cats", "dog", "sand", "and", "cat"]], expected: false, is_sample: false },
      { args: ["bb", ["a", "b", "bbb", "bbbb"]], expected: true, is_sample: false }
    ],
    entry_point: 'wordBreak',
    discussions: [
      {
        id: 'disc-wb-1',
        author: 'Nikhil Rathi',
        avatar: 'NR',
        role: 'Google SWE',
        time: '4 days ago',
        upvotes: 29,
        title: 'Trie optimization for large dictionaries',
        content: 'When wordDict has tens of thousands of words, inserting words into a Trie allows finding matching prefixes from index i in O(max_word_len) instead of doing repeated string slicing.'
      }
    ],
    editorial: {
      approach: 'Prefix Dynamic Programming',
      explanation: 'dp[i] indicates whether prefix s[0:i] can be formed by dictionary words. We check each valid earlier split point j where dp[j] is true.',
      python_solution: `def wordBreak(s, wordDict):\n    words = set(wordDict)\n    dp = [True] + [False] * len(s)\n    for i in range(1, len(s) + 1):\n        dp[i] = any(dp[j] and s[j:i] in words for j in range(i))\n    return dp[-1]`,
      javascript_solution: `function wordBreak(s, wordDict) {\n    const words = new Set(wordDict), dp = new Array(s.length + 1).fill(false);\n    dp[0] = true;\n    for (let i = 1; i <= s.length; i++) {\n        for (let j = 0; j < i; j++) {\n            if (dp[j] && words.has(s.slice(j, i))) { dp[i] = true; break; }\n        }\n    }\n    return dp[s.length];\n}`,
      cpp_solution: `bool wordBreak(string s, vector<string>& wordDict) {\n    unordered_set<string> st(wordDict.begin(), wordDict.end());\n    vector<bool> dp(s.size() + 1, false);\n    dp[0] = true;\n    for (int i = 1; i <= s.size(); i++) {\n        for (int j = 0; j < i; j++) {\n            if (dp[j] && st.count(s.substr(j, i - j))) { dp[i] = true; break; }\n        }\n    }\n    return dp[s.size()];\n}`,
      java_solution: `public static boolean wordBreak(String s, List<String> wordDict) {\n    Set<String> set = new HashSet<>(wordDict);\n    boolean[] dp = new boolean[s.length() + 1];\n    dp[0] = true;\n    for (int i = 1; i <= s.length(); i++) {\n        for (int j = 0; j < i; j++) {\n            if (dp[j] && set.contains(s.substring(j, i))) { dp[i] = true; break; }\n        }\n    }\n    return dp[s.length()];\n}`
    }
  },
  {
    slug: 'search-in-rotated-sorted-array',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    category: 'Searching',
    companies: ['Google', 'Microsoft', 'Amazon', 'Meta'],
    accuracy: '39.8%',
    points: 5,
    time_complexity: 'O(log N)',
    space_complexity: 'O(1)',
    hints: [
      'In a rotated sorted array, at least one half (left or right) is ALWAYS sorted.',
      'Check if arr[low] <= arr[mid]. If so, the left half is sorted.',
      'Determine if the target falls within the sorted half boundaries to adjust pointers.'
    ],
    description: `Given the array nums after the rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums. You must write an algorithm with O(log n) runtime complexity.`,
    examples: [
      { input: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 0', output: '4', explanation: '0 exists at index 4.' },
      { input: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 3', output: '-1', explanation: '3 is not in nums.' }
    ],
    constraints: ['1 <= nums.length <= 5000', '-10^4 <= nums[i], target <= 10^4', 'All values are unique'],
    starter_code: {
      python: `def search(nums, target):\n    low, high = 0, len(nums) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[low] <= nums[mid]:\n            if nums[low] <= target < nums[mid]:\n                high = mid - 1\n            else:\n                low = mid + 1\n        else:\n            if nums[mid] < target <= nums[high]:\n                low = mid + 1\n            else:\n                high = mid - 1\n    return -1\n`,
      javascript: `function search(nums, target) {\n    let low = 0, high = nums.length - 1;\n    while (low <= high) {\n        const mid = Math.floor((low + high) / 2);\n        if (nums[mid] === target) return mid;\n        if (nums[low] <= nums[mid]) {\n            if (nums[low] <= target && target < nums[mid]) high = mid - 1;\n            else low = mid + 1;\n        } else {\n            if (nums[mid] < target && target <= nums[high]) low = mid + 1;\n            else high = mid - 1;\n        }\n    }\n    return -1;\n}\n`,
      cpp: `// C++ 17 Solution\n#include <vector>\nusing namespace std;\n\nint search(vector<int>& nums, int target) {\n    int low = 0, high = nums.size() - 1;\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (nums[mid] == target) return mid;\n        if (nums[low] <= nums[mid]) {\n            if (nums[low] <= target && target < nums[mid]) high = mid - 1;\n            else low = mid + 1;\n        } else {\n            if (nums[mid] < target && target <= nums[high]) low = mid + 1;\n            else high = mid - 1;\n        }\n    }\n    return -1;\n}`,
      java: `// Java 17 Solution\nclass Solution {\n    public static int search(int[] nums, int target) {\n        int low = 0, high = nums.length - 1;\n        while (low <= high) {\n            int mid = low + (high - low) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[low] <= nums[mid]) {\n                if (nums[low] <= target && target < nums[mid]) high = mid - 1;\n                else low = mid + 1;\n            } else {\n                if (nums[mid] < target && target <= nums[high]) low = mid + 1;\n                else high = mid - 1;\n            }\n        }\n        return -1;\n    }\n}`
    },
    test_cases: [
      { args: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4, is_sample: true },
      { args: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1, is_sample: true },
      { args: [[1], 0], expected: -1, is_sample: false },
      { args: [[3, 1], 1], expected: 1, is_sample: false }
    ],
    entry_point: 'search',
    discussions: [
      {
        id: 'disc-rot-1',
        author: 'Sidharth Jain',
        avatar: 'SJ',
        role: 'Amazon SDE-1',
        time: '1 week ago',
        upvotes: 37,
        title: 'Interview question variant: With Duplicates',
        content: 'When duplicates are allowed (e.g. nums[low] == nums[mid] == nums[high]), you cannot determine which half is sorted. In that scenario, simply decrement high and increment low (`low += 1, high -= 1`), giving worst-case O(N) time.'
      }
    ],
    editorial: {
      approach: 'Modified Binary Search with Sorted Half Isolation',
      explanation: 'At any pivot, one half is strictly sorted. Identify which half is sorted, test if target lies in that range, and shrink the search window in O(log N) time.',
      python_solution: `def search(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == target: return m\n        if nums[l] <= nums[m]:\n            if nums[l] <= target < nums[m]: r = m - 1\n            else: l = m + 1\n        else:\n            if nums[m] < target <= nums[r]: l = m + 1\n            else: r = m - 1\n    return -1`,
      javascript_solution: `function search(nums, target) {\n    let l = 0, r = nums.length - 1;\n    while (l <= r) {\n        const m = Math.floor((l + r) / 2);\n        if (nums[m] === target) return m;\n        if (nums[l] <= nums[m]) {\n            if (nums[l] <= target && target < nums[m]) r = m - 1;\n            else l = m + 1;\n        } else {\n            if (nums[m] < target && target <= nums[r]) l = m + 1;\n            else r = m - 1;\n        }\n    }\n    return -1;\n}`,
      cpp_solution: `int search(vector<int>& nums, int target) {\n    int l = 0, r = nums.size() - 1;\n    while (l <= r) {\n        int m = l + (r - l) / 2;\n        if (nums[m] == target) return m;\n        if (nums[l] <= nums[m]) {\n            if (nums[l] <= target && target < nums[m]) r = m - 1;\n            else l = m + 1;\n        } else {\n            if (nums[m] < target && target <= nums[r]) l = m + 1;\n            else r = m - 1;\n        }\n    }\n    return -1;\n}`,
      java_solution: `public static int search(int[] nums, int target) {\n    int l = 0, r = nums.length - 1;\n    while (l <= r) {\n        int m = l + (r - l) / 2;\n        if (nums[m] == target) return m;\n        if (nums[l] <= nums[m]) {\n            if (nums[l] <= target && target < nums[m]) r = m - 1;\n            else l = m + 1;\n        } else {\n            if (nums[m] < target && target <= nums[r]) l = m + 1;\n            else r = m - 1;\n        }\n    }\n    return -1;\n}`
    }
  },
  {
    slug: 'missing-number',
    title: 'Missing Number in Array',
    difficulty: 'Easy',
    category: 'Arrays',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'TCS'],
    accuracy: '68.4%',
    points: 3,
    time_complexity: 'O(N)',
    space_complexity: 'O(1)',
    hints: [
      'The sum of first n natural numbers is n * (n + 1) / 2.',
      'Subtract the sum of elements present in the array from expected sum.',
      'Alternative approach: Use bitwise XOR of all indices and array values.'
    ],
    description: `Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.`,
    examples: [
      { input: 'nums = [3, 0, 1]', output: '2', explanation: 'n = 3 since there are 3 numbers, so all numbers are in [0, 3]. 2 is missing.' },
      { input: 'nums = [0, 1]', output: '2', explanation: 'n = 2, so all numbers are in [0, 2]. 2 is missing.' }
    ],
    constraints: ['n == nums.length', '1 <= n <= 10^4', '0 <= nums[i] <= n'],
    starter_code: {
      python: `def missingNumber(nums):\n    n = len(nums)\n    expected_sum = n * (n + 1) // 2\n    return expected_sum - sum(nums)\n`,
      javascript: `function missingNumber(nums) {\n    const n = nums.length;\n    const expected = (n * (n + 1)) / 2;\n    return expected - nums.reduce((a, b) => a + b, 0);\n}\n`,
      cpp: `// C++ 17 Solution\n#include <vector>\n#include <numeric>\nusing namespace std;\n\nint missingNumber(vector<int>& nums) {\n    int n = nums.size();\n    int expected = n * (n + 1) / 2;\n    int actual = accumulate(nums.begin(), nums.end(), 0);\n    return expected - actual;\n}`,
      java: `// Java 17 Solution\nclass Solution {\n    public static int missingNumber(int[] nums) {\n        int n = nums.length;\n        int expected = n * (n + 1) / 2;\n        int actual = 0;\n        for (int x : nums) actual += x;\n        return expected - actual;\n    }\n}`
    },
    test_cases: [
      { args: [[3, 0, 1]], expected: 2, is_sample: true },
      { args: [[0, 1]], expected: 2, is_sample: true },
      { args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expected: 8, is_sample: false },
      { args: [[0]], expected: 1, is_sample: false }
    ],
    entry_point: 'missingNumber',
    discussions: [
      {
        id: 'disc-miss-1',
        author: 'Ayush Singhal',
        avatar: 'AS',
        role: 'TCS Digital Lead',
        time: '1 week ago',
        upvotes: 26,
        title: 'Bitwise XOR method avoids integer overflow',
        content: 'While Gauss summation `n * (n + 1) / 2` works nicely, if n exceeds 10^5 in 32-bit integers, the product can overflow. Doing `xor_sum = xor_sum ^ i ^ nums[i]` avoids overflow completely!'
      }
    ],
    editorial: {
      approach: 'Gauss Sum Formula / XOR',
      explanation: 'Compute n * (n + 1) / 2 and subtract the sum of elements in the array.',
      python_solution: `def missingNumber(nums):\n    n = len(nums)\n    return n * (n + 1) // 2 - sum(nums)`,
      javascript_solution: `function missingNumber(nums) {\n    const n = nums.length;\n    return (n * (n + 1)) / 2 - nums.reduce((a, b) => a + b, 0);\n}`,
      cpp_solution: `int missingNumber(vector<int>& nums) {\n    int n = nums.size();\n    int total = n * (n + 1) / 2;\n    for (int x : nums) total -= x;\n    return total;\n}`,
      java_solution: `public static int missingNumber(int[] nums) {\n    int n = nums.length;\n    int total = n * (n + 1) / 2;\n    for (int x : nums) total -= x;\n    return total;\n}`
    }
  },
  {
    slug: 'fizzbuzz',
    title: 'FizzBuzz Classic',
    difficulty: 'Basic',
    category: 'Math',
    companies: ['Apple', 'TCS', 'Infosys'],
    accuracy: '82.5%',
    points: 2,
    time_complexity: 'O(N)',
    space_complexity: 'O(1)',
    hints: [
      'Check divisibility by 15 (both 3 and 5) first.',
      'Then check 3 and 5 separately.',
      'Else return string representation of the number.'
    ],
    description: `Given an integer n, return an array where answer[i] is 'FizzBuzz' if i is divisible by 3 and 5, 'Fizz' if divisible by 3, 'Buzz' if divisible by 5, or str(i).`,
    examples: [
      { input: 'n = 5', output: '["1", "2", "Fizz", "4", "Buzz"]', explanation: '3 is Fizz, 5 is Buzz.' }
    ],
    constraints: ['1 <= n <= 10^4'],
    starter_code: {
      python: `def fizzBuzz(n):\n    res = []\n    for i in range(1, n + 1):\n        if i % 15 == 0: res.append("FizzBuzz")\n        elif i % 3 == 0: res.append("Fizz")\n        elif i % 5 == 0: res.append("Buzz")\n        else: res.append(str(i))\n    return res\n`,
      javascript: `function fizzBuzz(n) {\n    const res = [];\n    for (let i = 1; i <= n; i++) {\n        if (i % 15 === 0) res.push("FizzBuzz");\n        else if (i % 3 === 0) res.push("Fizz");\n        else if (i % 5 === 0) res.push("Buzz");\n        else res.push(String(i));\n    }\n    return res;\n}\n`,
      cpp: `// C++ 17 Solution\n#include <vector>\n#include <string>\nusing namespace std;\n\nvector<string> fizzBuzz(int n) {\n    vector<string> res;\n    for (int i = 1; i <= n; i++) {\n        if (i % 15 == 0) res.push_back("FizzBuzz");\n        else if (i % 3 == 0) res.push_back("Fizz");\n        else if (i % 5 == 0) res.push_back("Buzz");\n        else res.push_back(to_string(i));\n    }\n    return res;\n}`,
      java: `// Java 17 Solution\nimport java.util.*;\n\nclass Solution {\n    public static List<String> fizzBuzz(int n) {\n        List<String> res = new ArrayList<>();\n        for (int i = 1; i <= n; i++) {\n            if (i % 15 == 0) res.add("FizzBuzz");\n            else if (i % 3 == 0) res.add("Fizz");\n            else if (i % 5 == 0) res.add("Buzz");\n            else res.add(String.valueOf(i));\n        }\n        return res;\n    }\n}`
    },
    test_cases: [
      { args: [3], expected: ["1", "2", "Fizz"], is_sample: true },
      { args: [5], expected: ["1", "2", "Fizz", "4", "Buzz"], is_sample: true },
      { args: [1], expected: ["1"], is_sample: false }
    ],
    entry_point: 'fizzBuzz',
    discussions: [
      {
        id: 'disc-fb-1',
        author: 'Pooja Hegde',
        avatar: 'PH',
        role: 'Infosys Specialist Programmer',
        time: '2 weeks ago',
        upvotes: 18,
        title: 'String concatenation alternative',
        content: 'Instead of checking % 15, you can concatenate "Fizz" when i % 3 == 0 and "Buzz" when i % 5 == 0. If empty, append the number.'
      }
    ],
    editorial: {
      approach: 'Modulo Simulation',
      explanation: 'Evaluate divisibility by 15 first, then 3, then 5.',
      python_solution: `def fizzBuzz(n):\n    return ["FizzBuzz" if i % 15 == 0 else "Fizz" if i % 3 == 0 else "Buzz" if i % 5 == 0 else str(i) for i in range(1, n + 1)]`,
      javascript_solution: `function fizzBuzz(n) {\n    return Array.from({length: n}, (_, i) => {\n        const v = i + 1;\n        if (v % 15 === 0) return "FizzBuzz";\n        if (v % 3 === 0) return "Fizz";\n        if (v % 5 === 0) return "Buzz";\n        return String(v);\n    });\n}`,
      cpp_solution: `vector<string> fizzBuzz(int n) {\n    vector<string> res;\n    for (int i = 1; i <= n; i++) {\n        if (i % 15 == 0) res.push_back("FizzBuzz");\n        else if (i % 3 == 0) res.push_back("Fizz");\n        else if (i % 5 == 0) res.push_back("Buzz");\n        else res.push_back(to_string(i));\n    }\n    return res;\n}`,
      java_solution: `public static List<String> fizzBuzz(int n) {\n    List<String> res = new ArrayList<>();\n    for (int i = 1; i <= n; i++) {\n        if (i % 15 == 0) res.add("FizzBuzz");\n        else if (i % 3 == 0) res.add("Fizz");\n        else if (i % 5 == 0) res.add("Buzz");\n        else res.add(String.valueOf(i));\n    }\n    return res;\n}`
    }
  }
];

export const DATADRIX_PROBLEMS = PROBLEMS_CATALOG;

// ==========================================
// DATADRIX CONTESTS & HIRING CHALLENGES
// ==========================================
export const DATADRIX_CONTESTS = [
  {
    id: 'datadrix-weekly-142',
    title: 'DataDrix Weekly Contest 142',
    tagline: 'Sharpen your competitive coding edge against 15,000+ Developers worldwide',
    type: 'Weekly Rated Contest',
    status: 'live', // 'live' | 'upcoming' | 'past'
    badge: 'Rated ⚡',
    duration: '90 Mins',
    durationMinutes: 90,
    startTime: 'Live Now',
    totalScore: 1000,
    registeredCount: 15420,
    problems: [
      { slug: 'fizzbuzz', title: 'FizzBuzz Classic', points: 100, difficulty: 'Basic', time: '15m' },
      { slug: 'subarray-with-given-sum', title: 'Subarray with Given Sum', points: 200, difficulty: 'Medium', time: '25m' },
      { slug: 'two-sum', title: 'Two Sum Target Pair', points: 300, difficulty: 'Easy', time: '20m' },
      { slug: 'trapping-rain-water', title: 'Trapping Rain Water', points: 400, difficulty: 'Hard', time: '30m' }
    ],
    prizes: [
      'Rank 1: DataDrix Swag Kit + Laptop Backpack + Direct SDE Referral',
      'Rank 2-5: Premium DataDrix Hoodies + Amazon Voucher ₹3,000',
      'Rank 6-25: 500 DataDrix Credits + Course Discount Coupons'
    ],
    rules: [
      'Every failed submission incurs a 5-minute penalty upon subsequent accepted submission.',
      'Strict plagiarism detection: solutions are screened against global AST similarity detectors.',
      'Contest rating delta (+/-) is computed dynamically upon contest submission.'
    ]
  },
  {
    id: 'job-a-thon-38',
    title: 'Job-A-Thon 38: Hiring Challenge for SDE 1 & 2',
    tagline: 'Direct hiring fast-track for Google, Amazon, Microsoft, Razorpay, Flipkart & Swiggy',
    type: 'Hiring Fast-Track',
    status: 'upcoming',
    badge: 'Hiring Fast-Track 💼',
    duration: '120 Mins',
    durationMinutes: 120,
    startTime: 'Tomorrow at 8:00 PM IST',
    totalScore: 1150,
    registeredCount: 29840,
    companies: ['Google', 'Amazon', 'Microsoft', 'Razorpay', 'Flipkart', 'Swiggy'],
    hiringRoles: ['SDE-1 (Frontend / Backend / Fullstack)', 'SDE-2 (Distributed Systems)', 'Data Engineer'],
    problems: [
      { slug: 'kadanes-algorithm', title: 'Kadane’s Maximum Subarray', points: 150, difficulty: 'Medium', time: '25m' },
      { slug: 'search-in-rotated-sorted-array', title: 'Search in Rotated Sorted Array', points: 250, difficulty: 'Medium', time: '30m' },
      { slug: '01-knapsack-problem', title: '0/1 Knapsack Problem', points: 350, difficulty: 'Medium', time: '35m' },
      { slug: 'longest-common-subsequence', title: 'Longest Common Subsequence', points: 400, difficulty: 'Medium', time: '40m' }
    ],
    prizes: [
      'Top 100 Coders receive direct interview invites from hiring partner companies',
      'Guaranteed resume shortlisting with priority recruiters'
    ],
    rules: [
      'Open to 2024, 2025, 2026 graduates and working professionals with 0-4 years experience.',
      'Coding window is 120 minutes from the time you begin.',
      'Multiple language support: Python 3, C++ 17, Java 17, and JavaScript.'
    ]
  },
  {
    id: 'bi-wizard-college-cup',
    title: 'Bi-Wizard Inter-College National Coding Cup',
    tagline: 'Compete for your university bragging rights and win campus trophy honors',
    type: 'Inter-College Championship',
    status: 'upcoming',
    badge: 'College Cup 🎓',
    duration: '90 Mins',
    durationMinutes: 90,
    startTime: 'Sunday at 6:00 PM IST',
    totalScore: 1000,
    registeredCount: 11250,
    problems: [
      { slug: 'missing-number', title: 'Missing Number in Array', points: 100, difficulty: 'Easy', time: '15m' },
      { slug: 'parenthesis-checker', title: 'Parenthesis Checker', points: 200, difficulty: 'Easy', time: '20m' },
      { slug: 'coin-change', title: 'Coin Change Minimum Coins', points: 300, difficulty: 'Medium', time: '25m' },
      { slug: 'word-break', title: 'Word Break Problem', points: 400, difficulty: 'Hard', time: '30m' }
    ],
    prizes: [
      'Top University: National Trophy + ₹50,000 Hackathon Sponsorship',
      'Top 10 Students: Direct tech internship offers and DataDrix Medals'
    ],
    rules: [
      'Must enter college email / institute ID during registration.',
      'Cumulative score of top 5 students from an institution determines college rank.'
    ]
  },
  {
    id: 'datadrix-weekly-141',
    title: 'DataDrix Weekly Contest 141 (Archive)',
    tagline: 'Test your speed and precision against the real contest leaderboard of Weekly 141',
    type: 'Past Rated Contest',
    status: 'past',
    badge: 'Virtual Mode ⏱️',
    duration: '90 Mins',
    durationMinutes: 90,
    startTime: 'Finished (Virtual Open)',
    totalScore: 1000,
    winner: 'shubham_iitb (1000 pts in 28m)',
    registeredCount: 18400,
    problems: [
      { slug: 'binary-search', title: 'Binary Search Algorithm', points: 100, difficulty: 'Easy', time: '10m' },
      { slug: 'reverse-words-in-string', title: 'Reverse Words in a String', points: 200, difficulty: 'Easy', time: '20m' },
      { slug: 'next-greater-element', title: 'Next Greater Element', points: 300, difficulty: 'Medium', time: '25m' },
      { slug: 'trapping-rain-water', title: 'Trapping Rain Water', points: 400, difficulty: 'Hard', time: '35m' }
    ],
    prizes: [
      'Archived contest for self-paced virtual simulation',
      'Includes simulated live leaderboard comparison'
    ],
    rules: [
      'Virtual contest runs under authentic timed conditions.',
      'Timer starts immediately upon entering.'
    ]
  }
];

// ==========================================
// DATADRIX GLOBAL LEADERBOARD
// ==========================================
export const DATADRIX_LEADERBOARD = [
  {
    rank: 1,
    handle: 'ananya_code',
    name: 'Ananya Sharma',
    avatar: 'AS',
    institute: 'IIT Bombay',
    rating: 2842,
    tier: 'Grandmaster',
    solvedCount: 894,
    streak: 210,
    country: '🇮🇳 India',
    podiums: 18
  },
  {
    rank: 2,
    handle: 'aditya_dsa',
    name: 'Aditya Singhal',
    avatar: 'AS',
    institute: 'DTU Delhi',
    rating: 2795,
    tier: 'Grandmaster',
    solvedCount: 856,
    streak: 184,
    country: '🇮🇳 India',
    podiums: 14
  },
  {
    rank: 3,
    handle: 'rohan_dev',
    name: 'Rohan Kulkarni',
    avatar: 'RK',
    institute: 'BITS Pilani',
    rating: 2730,
    tier: 'Grandmaster',
    solvedCount: 812,
    streak: 145,
    country: '🇮🇳 India',
    podiums: 11
  },
  {
    rank: 4,
    handle: 'priya_algo',
    name: 'Priya Nambiar',
    avatar: 'PN',
    institute: 'IIIT Hyderabad',
    rating: 2680,
    tier: 'Candidate Master',
    solvedCount: 780,
    streak: 92,
    country: '🇮🇳 India',
    podiums: 9
  },
  {
    rank: 5,
    handle: 'vikram_singh',
    name: 'Vikramaditya Singh',
    avatar: 'VS',
    institute: 'NIT Trichy',
    rating: 2640,
    tier: 'Candidate Master',
    solvedCount: 745,
    streak: 88,
    country: '🇮🇳 India',
    podiums: 7
  },
  {
    rank: 6,
    handle: 'neha_gupta',
    name: 'Neha Gupta',
    avatar: 'NG',
    institute: 'NSUT Delhi',
    rating: 2590,
    tier: 'Candidate Master',
    solvedCount: 710,
    streak: 75,
    country: '🇮🇳 India',
    podiums: 6
  },
  {
    rank: 7,
    handle: 'samir_patel',
    name: 'Samir Patel',
    avatar: 'SP',
    institute: 'IIT Kharagpur',
    rating: 2540,
    tier: 'Master',
    solvedCount: 690,
    streak: 64,
    country: '🇮🇳 India',
    podiums: 5
  },
  {
    rank: 8,
    handle: 'tanya_reddy',
    name: 'Tanya Reddy',
    avatar: 'TR',
    institute: 'IIT Madras',
    rating: 2495,
    tier: 'Master',
    solvedCount: 660,
    streak: 112,
    country: '🇮🇳 India',
    podiums: 4
  },
  {
    rank: 9,
    handle: 'alex_chen',
    name: 'Alex Chen',
    avatar: 'AC',
    institute: 'UC Berkeley',
    rating: 2465,
    tier: 'Master',
    solvedCount: 640,
    streak: 80,
    country: '🇺🇸 USA',
    podiums: 5
  },
  {
    rank: 10,
    handle: 'kunal_kush',
    name: 'Kunal Kushwaha',
    avatar: 'KK',
    institute: 'Jamia Millia',
    rating: 2430,
    tier: 'Master',
    solvedCount: 625,
    streak: 130,
    country: '🇮🇳 India',
    podiums: 3
  },
  {
    rank: 11,
    handle: 'arjun_verma',
    name: 'Arjun Verma',
    avatar: 'AV',
    institute: 'PES University',
    rating: 2380,
    tier: 'Specialist',
    solvedCount: 580,
    streak: 45,
    country: '🇮🇳 India',
    podiums: 2
  },
  {
    rank: 12,
    handle: 'sneha_mukherjee',
    name: 'Sneha Mukherjee',
    avatar: 'SM',
    institute: 'Jadavpur University',
    rating: 2340,
    tier: 'Specialist',
    solvedCount: 550,
    streak: 52,
    country: '🇮🇳 India',
    podiums: 2
  }
];

// ==========================================
// DATADRIX COMPANY INTERVIEW KITS & TOPIC DISTRIBUTIONS
// ==========================================
export const DATADRIX_COMPANY_KITS = [
  {
    id: 'amazon',
    name: 'Amazon',
    badge: 'Tier 1 • High Volume',
    color: '#f59e0b',
    tagline: 'Customer Obsession, Bias for Action & Scalable Systems',
    compensation: '₹42 - ₹50 LPA CTC',
    rounds: [
      { name: '1. Online Assessment (OA)', desc: '2 Algorithmic DSA questions on Hackerrank (90m) + 20m Work Style Assessment.' },
      { name: '2. Technical Round 1', desc: 'Core DSA: Sliding window, Two Pointers, and Arrays. Space/time complexity grilling.' },
      { name: '3. Technical Round 2', desc: 'Trees, Graphs, or Monotonic Stacks + Low-Level Design (LLD) questions.' },
      { name: '4. Bar Raiser Round', desc: '50% Behavioral based on 14 Amazon Leadership Principles + 1 complex DSA problem.' }
    ],
    topicDistribution: [
      { topic: 'Arrays & Two Pointers', pct: 30, color: '#f59e0b' },
      { topic: 'Trees & Graphs', pct: 25, color: '#3b82f6' },
      { topic: 'Dynamic Programming', pct: 20, color: '#10b981' },
      { topic: 'Monotonic Stack / Queue', pct: 15, color: '#8b5cf6' },
      { topic: 'System Design / LLD', pct: 10, color: '#ec4899' }
    ],
    frequentProblems: [
      'trapping-rain-water',
      'subarray-with-given-sum',
      'two-sum',
      '01-knapsack-problem',
      'parenthesis-checker'
    ],
    behavioralTip: 'Amazon weighs Leadership Principles equal to technical prowess. Frame every behavioral story with STAR (Situation, Task, Action, Result) highlighting customer impact.'
  },
  {
    id: 'google',
    name: 'Google',
    badge: 'Tier 1 • Algorithmic Rigor',
    color: '#3b82f6',
    tagline: 'Pioneering Search, Distributed Computing & AI',
    compensation: '₹50 - ₹68 LPA CTC',
    rounds: [
      { name: '1. Google Online Challenge (GOC)', desc: '2 challenging algorithmic problems testing optimal Big-O bounds.' },
      { name: '2. Technical Phone Screen', desc: '45-minute shared Google Docs / CoderPad session with a Google engineer.' },
      { name: '3. Onsite Rounds (3 Coding)', desc: 'Rigorous rounds testing Dynamic Programming, Graph Shortest Paths, and Recursion.' },
      { name: '4. Googleyness & Leadership', desc: 'Assesses intellectual humility, thriving in ambiguity, and ethical decision-making.' }
    ],
    topicDistribution: [
      { topic: 'Dynamic Programming', pct: 32, color: '#10b981' },
      { topic: 'Graph Algorithms & BFS/DFS', pct: 28, color: '#3b82f6' },
      { topic: 'Binary Search & Math', pct: 18, color: '#f59e0b' },
      { topic: 'Sliding Window', pct: 14, color: '#8b5cf6' },
      { topic: 'System Design', pct: 8, color: '#ec4899' }
    ],
    frequentProblems: [
      'search-in-rotated-sorted-array',
      'longest-common-subsequence',
      'binary-search',
      'word-break',
      'two-sum'
    ],
    behavioralTip: 'Google interviewers intentionally give vague requirements. Always ask clarifying questions about array bounds, duplicate items, and memory limits before typing code.'
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    badge: 'Tier 1 • Enterprise & Cloud',
    color: '#0ea5e9',
    tagline: 'Azure Cloud, Operating Systems & Productivity Innovation',
    compensation: '₹44 - ₹55 LPA CTC',
    rounds: [
      { name: '1. Codility OA (75 mins)', desc: '3 problems focused on Strings, Arrays, and Linked Lists.' },
      { name: '2. Technical Interview 1', desc: 'Algorithmic problem solving with emphasis on clean, readable code.' },
      { name: '3. Technical Interview 2', desc: 'Data structures, OOPs paradigms, and modular component architecture.' },
      { name: '4. Partner / Director Round', desc: 'Culture fit, system architecture vision, and past engineering challenges.' }
    ],
    topicDistribution: [
      { topic: 'Strings & Arrays', pct: 28, color: '#0ea5e9' },
      { topic: 'Binary Trees & BST', pct: 24, color: '#10b981' },
      { topic: 'Stacks & Queues', pct: 20, color: '#8b5cf6' },
      { topic: 'Dynamic Programming', pct: 18, color: '#f59e0b' },
      { topic: 'System Architecture', pct: 10, color: '#ec4899' }
    ],
    frequentProblems: [
      'reverse-words-in-string',
      'parenthesis-checker',
      'kadanes-algorithm',
      'two-sum',
      'missing-number'
    ],
    behavioralTip: 'Microsoft places high value on collaborative spirit and growth mindset. Be receptive to hints, articulate trade-offs, and explain how you write unit tests.'
  },
  {
    id: 'meta',
    name: 'Meta',
    badge: 'Tier 1 • High Velocity',
    color: '#8b5cf6',
    tagline: 'Social Graph, Ephemeral Media & High-Throughput Infrastructure',
    compensation: '₹55 - ₹75 LPA CTC',
    rounds: [
      { name: '1. Technical Screen (45 mins)', desc: '2 coding problems in 45 minutes on CoderPad. Speed and accuracy are decisive.' },
      { name: '2. Full Onsite Coding 1', desc: '45 mins: 2 Medium/Hard algorithmic challenges.' },
      { name: '3. Full Onsite Coding 2', desc: '45 mins: Hash maps, Graph traversal, and Trie/String transformations.' },
      { name: '4. System Design & Culture', desc: '45 mins HLD (e.g., Instagram Stories Feed, Messenger Chat) + Behavioral.' }
    ],
    topicDistribution: [
      { topic: 'Arrays & Hash Maps', pct: 35, color: '#8b5cf6' },
      { topic: 'Two Pointers & Search', pct: 25, color: '#3b82f6' },
      { topic: 'Graphs & Trees', pct: 22, color: '#10b981' },
      { topic: 'Dynamic Programming', pct: 18, color: '#f59e0b' }
    ],
    frequentProblems: [
      'two-sum',
      'subarray-with-given-sum',
      'reverse-words-in-string',
      'search-in-rotated-sorted-array',
      'word-break'
    ],
    behavioralTip: 'Speed is king at Meta. You must finish 2 full coding problems in 45 minutes with optimal time complexity and working syntax. State Big-O immediately.'
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    badge: 'Tier 1 • E-Commerce Scalability',
    color: '#eab308',
    tagline: 'Big Billion Days Scale, Microservices & Flash Sales',
    compensation: '₹40 - ₹52 LPA CTC',
    rounds: [
      { name: '1. Machine Coding Round (90 mins)', desc: 'Write end-to-end, object-oriented, runnable code with clean design patterns.' },
      { name: '2. DSA & Algorithms Round', desc: 'Dynamic Programming, DP with Bitmask, and Heaps.' },
      { name: '3. System Design (HLD)', desc: 'Scalable distributed architectures: Inventory reservations, Kafka pipelines.' },
      { name: '4. Engineering Manager Round', desc: 'Culture fit, past project war-stories, and handling high-stress incidents.' }
    ],
    topicDistribution: [
      { topic: 'Machine Coding / LLD', pct: 35, color: '#eab308' },
      { topic: 'Dynamic Programming', pct: 25, color: '#10b981' },
      { topic: 'Arrays & Heap', pct: 20, color: '#3b82f6' },
      { topic: 'Graph Theory', pct: 20, color: '#8b5cf6' }
    ],
    frequentProblems: [
      '01-knapsack-problem',
      'trapping-rain-water',
      'subarray-with-given-sum',
      'coin-change'
    ],
    behavioralTip: 'Practice object-oriented design patterns (Strategy, Factory, Singleton). In the machine coding round, clean separation of concerns and executable unit tests are mandatory.'
  }
];

// ==========================================
// ALGORITHM STEP-BY-STEP VISUALIZER TRACES
// ==========================================
export const ALGORITHM_VISUALIZER_DATA = {
  'two-sum': {
    title: 'Two Sum: Two Pointers / Hash Map Complement Visualizer',
    inputArray: [2, 7, 11, 15],
    target: 9,
    steps: [
      {
        step: 1,
        currentIndex: 0,
        activeIndices: [0],
        pointers: { current: 0 },
        explanation: 'Initialize an empty Hash Map. Inspect index 0: element is 2. Target complement required = 9 - 2 = 7.',
        state: { complement: 7, map: {} },
        status: 'Searching map for complement 7... Not found.',
        action: 'Store { 2: index 0 } in Hash Map.'
      },
      {
        step: 2,
        currentIndex: 1,
        activeIndices: [1],
        pointers: { current: 1 },
        explanation: 'Inspect index 1: element is 7. Target complement required = 9 - 7 = 2.',
        state: { complement: 2, map: { '2': 0 } },
        status: 'Searching map for complement 2... Match Found at index 0!',
        action: 'Solution Pair Identified: Indices [0, 1].'
      },
      {
        step: 3,
        currentIndex: 1,
        activeIndices: [0, 1],
        pointers: { left: 0, right: 1 },
        explanation: 'Algorithm terminates in O(N) time with O(N) auxiliary space. arr[0] (2) + arr[1] (7) = 9.',
        state: { complement: 2, map: { '2': 0, '7': 1 } },
        status: 'SUCCESS: Target 9 reached!',
        action: 'Return [0, 1].'
      }
    ]
  },
  'subarray-with-given-sum': {
    title: 'Subarray with Given Sum: Sliding Window Dynamic Window Visualizer',
    inputArray: [1, 2, 3, 7, 5],
    target: 12,
    steps: [
      {
        step: 1,
        activeIndices: [0],
        pointers: { left: 0, right: 0 },
        currentSum: 1,
        explanation: 'Initialize window at left = 0, right = 0. Add arr[0] (1) to curr_sum. curr_sum = 1.',
        status: 'curr_sum (1) < target (12). Expand window by moving right pointer forward.',
        action: 'right++'
      },
      {
        step: 2,
        activeIndices: [0, 1],
        pointers: { left: 0, right: 1 },
        currentSum: 3,
        explanation: 'Expand window to include arr[1] (2). curr_sum = 1 + 2 = 3.',
        status: 'curr_sum (3) < target (12). Expand window further.',
        action: 'right++'
      },
      {
        step: 3,
        activeIndices: [0, 1, 2],
        pointers: { left: 0, right: 2 },
        currentSum: 6,
        explanation: 'Expand window to include arr[2] (3). curr_sum = 3 + 3 = 6.',
        status: 'curr_sum (6) < target (12). Continue expanding right.',
        action: 'right++'
      },
      {
        step: 4,
        activeIndices: [0, 1, 2, 3],
        pointers: { left: 0, right: 3 },
        currentSum: 13,
        explanation: 'Expand window to include arr[3] (7). curr_sum = 6 + 7 = 13.',
        status: 'curr_sum (13) > target (12)! Window sum exceeded target. Shrink from the left!',
        action: 'curr_sum -= arr[left]; left++'
      },
      {
        step: 5,
        activeIndices: [1, 2, 3],
        pointers: { left: 1, right: 3 },
        currentSum: 12,
        explanation: 'Subtract arr[0] (1). New curr_sum = 13 - 1 = 12. Left pointer is now at index 1.',
        status: 'curr_sum (12) === target (12)! Exact match found!',
        action: 'Return 1-based indices: [left + 1, right + 1] -> [2, 4].'
      }
    ]
  },
  'trapping-rain-water': {
    title: 'Trapping Rain Water: Two Pointers Elevation & Water Trapping Visualizer',
    inputArray: [3, 0, 2, 0, 4],
    target: 7,
    steps: [
      {
        step: 1,
        activeIndices: [0, 4],
        pointers: { left: 0, right: 4 },
        waterTrapped: 0,
        explanation: 'Initialize left = 0, right = 4. left_max = arr[0] (3), right_max = arr[4] (4).',
        status: 'left_max (3) < right_max (4). Process left side.',
        action: 'left++ -> index 1'
      },
      {
        step: 2,
        activeIndices: [1, 4],
        pointers: { left: 1, right: 4 },
        waterTrapped: 3,
        explanation: 'Inspect index 1: height is 0. Trapped water = left_max (3) - 0 = 3 units.',
        status: 'Accumulated water = 3 units.',
        action: 'left++ -> index 2'
      },
      {
        step: 3,
        activeIndices: [2, 4],
        pointers: { left: 2, right: 4 },
        waterTrapped: 4,
        explanation: 'Inspect index 2: height is 2. Trapped water = left_max (3) - 2 = 1 unit.',
        status: 'Accumulated water = 3 + 1 = 4 units.',
        action: 'left++ -> index 3'
      },
      {
        step: 4,
        activeIndices: [3, 4],
        pointers: { left: 3, right: 4 },
        waterTrapped: 7,
        explanation: 'Inspect index 3: height is 0. Trapped water = left_max (3) - 0 = 3 units.',
        status: 'Accumulated water = 4 + 3 = 7 units.',
        action: 'Pointers meet. Algorithm terminates in O(N) time & O(1) space.'
      }
    ]
  },
  'binary-search': {
    title: 'Binary Search: Divide & Conquer Search Space Halving Visualizer',
    inputArray: [-1, 0, 3, 5, 9, 12],
    target: 9,
    steps: [
      {
        step: 1,
        activeIndices: [0, 1, 2, 3, 4, 5],
        pointers: { low: 0, high: 5, mid: 2 },
        explanation: 'Initialize low = 0, high = 5. Calculate mid = low + (high - low) // 2 = 2. arr[2] = 3.',
        status: 'arr[mid] (3) < target (9). The target lies in the right half.',
        action: 'low = mid + 1 -> low = 3'
      },
      {
        step: 2,
        activeIndices: [3, 4, 5],
        pointers: { low: 3, high: 5, mid: 4 },
        explanation: 'Search space halved! low = 3, high = 5. Calculate mid = 3 + (5 - 3) // 2 = 4. arr[4] = 9.',
        status: 'arr[mid] (9) === target (9)! Target value located!',
        action: 'Return index 4. Completed in O(log N) time.'
      }
    ]
  },
  'kadanes-algorithm': {
    title: 'Kadane’s Algorithm: Maximum Subarray Running Sum Visualizer',
    inputArray: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
    target: 6,
    steps: [
      {
        step: 1,
        activeIndices: [0],
        pointers: { current: 0 },
        explanation: 'Inspect index 0: element is -2. current_sum = -2, max_so_far = -2.',
        status: 'current_sum is negative. Reset current_sum to 0 for next iteration.',
        action: 'max_so_far = -2'
      },
      {
        step: 2,
        activeIndices: [1],
        pointers: { current: 1 },
        explanation: 'Inspect index 1: element is 1. current_sum = 0 + 1 = 1. Update max_so_far = max(-2, 1) = 1.',
        status: 'max_so_far updated to 1.',
        action: 'Continue forward'
      },
      {
        step: 3,
        activeIndices: [1, 2],
        pointers: { current: 2 },
        explanation: 'Inspect index 2: element is -3. current_sum = 1 + (-3) = -2. Reset current_sum = 0.',
        status: 'max_so_far remains 1.',
        action: 'Reset running sum'
      },
      {
        step: 4,
        activeIndices: [3, 4, 5, 6],
        pointers: { current: 6 },
        explanation: 'Inspect elements 4, -1, 2, 1. Running current_sum = 4 - 1 + 2 + 1 = 6. Update max_so_far = 6.',
        status: 'Peak continuous sum reached: 6.',
        action: 'Subarray [4, -1, 2, 1] yields maximum sum = 6.'
      }
    ]
  }
};

