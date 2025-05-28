export const sampleCode = {
  python: `# Python Sample - Advanced Features

  print("Hello World")
`,

  c: `// C Sample - System Programming
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char name[50];
    int age;
    float grades[10];
    int grade_count;
} Student;

typedef struct {
    char operation[100];
} Operation;

typedef struct {
    char name[50];
    Operation history[100];
    int operation_count;
} Calculator;

// Function prototypes
int add_numbers(Calculator* calc, int a, int b);
int multiply_numbers(Calculator* calc, int a, int b);
float divide_numbers(Calculator* calc, float a, float b);
void add_grade(Student* student, float grade);
float calculate_average(Student* student);
void print_student_info(Student* student);

int main() {
    printf("⚙️ C Programming Demo\\n\\n");
    
    // Calculator operations
    Calculator calc;
    strcpy(calc.name, "C Calculator");
    calc.operation_count = 0;
    
    printf("🧮 %s\\n", calc.name);
    printf("20 + 15 = %d\\n", add_numbers(&calc, 20, 15));
    printf("8 × 7 = %d\\n", multiply_numbers(&calc, 8, 7));
    printf("45 ÷ 9 = %.2f\\n", divide_numbers(&calc, 45, 9));
    
    // Array operations
    int numbers[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    int size = sizeof(numbers) / sizeof(numbers[0]);
    int sum = 0;
    
    printf("\\n📊 Array Operations:\\n");
    printf("Numbers: ");
    for(int i = 0; i < size; i++) {
        printf("%d ", numbers[i]);
        sum += numbers[i];
    }
    printf("\\n");
    
    printf("Sum: %d\\n", sum);
    printf("Average: %.2f\\n", (float)sum / size);
    
    // Find maximum and minimum
    int max = numbers[0], min = numbers[0];
    for(int i = 1; i < size; i++) {
        if(numbers[i] > max) max = numbers[i];
        if(numbers[i] < min) min = numbers[i];
    }
    printf("Maximum: %d\\n", max);
    printf("Minimum: %d\\n", min);
    
    // Student management
    Student students[3];
    
    // Initialize students
    strcpy(students[0].name, "Alice");
    students[0].age = 20;
    students[0].grade_count = 0;
    
    strcpy(students[1].name, "Bob");
    students[1].age = 21;
    students[1].grade_count = 0;
    
    strcpy(students[2].name, "Carol");
    students[2].age = 19;
    students[2].grade_count = 0;
    
    // Add grades
    add_grade(&students[0], 95.5);
    add_grade(&students[0], 88.0);
    add_grade(&students[0], 92.5);
    
    add_grade(&students[1], 87.0);
    add_grade(&students[1], 91.5);
    add_grade(&students[1], 89.0);
    
    add_grade(&students[2], 94.0);
    add_grade(&students[2], 90.5);
    add_grade(&students[2], 96.0);
    
    printf("\\n👨‍🎓 Student Records:\\n");
    for(int i = 0; i < 3; i++) {
        print_student_info(&students[i]);
    }
    
    // String operations
    char message[] = "Hello, C Programming!";
    int length = strlen(message);
    
    printf("\\n📝 String Operations:\\n");
    printf("Message: %s\\n", message);
    printf("Length: %d\\n", length);
    
    // Character frequency
    int char_count[256] = {0};
    for(int i = 0; i < length; i++) {
        char_count[(unsigned char)message[i]]++;
    }
    
    printf("Character frequencies:\\n");
    for(int i = 0; i < 256; i++) {
        if(char_count[i] > 0 && i != ' ') {
            printf("'%c': %d\\n", i, char_count[i]);
        }
    }
    
    // Calculator history
    printf("\\n📝 Calculator History:\\n");
    for(int i = 0; i < calc.operation_count; i++) {
        printf("%d. %s\\n", i + 1, calc.history[i].operation);
    }
    
    return 0;
}

int add_numbers(Calculator* calc, int a, int b) {
    int result = a + b;
    sprintf(calc->history[calc->operation_count].operation, "%d + %d = %d", a, b, result);
    calc->operation_count++;
    return result;
}

int multiply_numbers(Calculator* calc, int a, int b) {
    int result = a * b;
    sprintf(calc->history[calc->operation_count].operation, "%d × %d = %d", a, b, result);
    calc->operation_count++;
    return result;
}

float divide_numbers(Calculator* calc, float a, float b) {
    float result = a / b;
    sprintf(calc->history[calc->operation_count].operation, "%.1f ÷ %.1f = %.2f", a, b, result);
    calc->operation_count++;
    return result;
}

void add_grade(Student* student, float grade) {
    if(student->grade_count < 10) {
        student->grades[student->grade_count] = grade;
        student->grade_count++;
    }
}

float calculate_average(Student* student) {
    if(student->grade_count == 0) return 0.0;
    
    float sum = 0.0;
    for(int i = 0; i < student->grade_count; i++) {
        sum += student->grades[i];
    }
    return sum / student->grade_count;
}

void print_student_info(Student* student) {
    printf("%s (%d years) - Average: %.1f\\n", 
           student->name, student->age, calculate_average(student));
}`,

  cpp: `// C++ Sample - Object-Oriented Programming
#include <iostream>
#include <vector>


int main() {
    std::cout << "C++ Programming Demo" << std::endl << std::endl;
    
    
    return 0;
}`,

  javascript: `// JavaScript Sample - Modern ES6+ Features

  console.log('Hello World')

`,

  go: `// Go Sample - Concurrent Programming
package main

import (
    "fmt"
    "math"
    "sort"
    "strings"
)

type Calculator struct {
    name       string
    operations []string
}

func NewCalculator(name string) *Calculator {
    return &Calculator{
        name:       name,
        operations: make([]string, 0),
    }
}

func (c *Calculator) Add(a, b int) int {
    result := a + b
    c.operations = append(c.operations, fmt.Sprintf("%d + %d = %d", a, b, result))
    return result
}

func (c *Calculator) Multiply(a, b int) int {
    result := a * b
    c.operations = append(c.operations, fmt.Sprintf("%d × %d = %d", a, b, result))
    return result
}

func (c *Calculator) Divide(a, b float64) float64 {
    if b == 0 {
        panic("division by zero")
    }
    result := a / b
    c.operations = append(c.operations, fmt.Sprintf("%.1f ÷ %.1f = %.2f", a, b, result))
    return result
}

func (c *Calculator) GetHistory() []string {
    return c.operations
}

func (c *Calculator) GetName() string {
    return c.name
}

type Student struct {
    Name   string
    Age    int
    Grades []float64
}

func NewStudent(name string, age int) *Student {
    return &Student{
        Name:   name,
        Age:    age,
        Grades: make([]float64, 0),
    }
}

func (s *Student) AddGrade(grade float64) {
    s.Grades = append(s.Grades, grade)
}

func (s *Student) GetAverage() float64 {
    if len(s.Grades) == 0 {
        return 0.0
    }
    
    sum := 0.0
    for _, grade := range s.Grades {
        sum += grade
    }
    return sum / float64(len(s.Grades))
}

func (s *Student) String() string {
    return fmt.Sprintf("%s (%d years) - Average: %.1f", s.Name, s.Age, s.GetAverage())
}

type Shape interface {
    Area() float64
    Perimeter() float64
}

type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return math.Pi * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
    return 2 * math.Pi * c.Radius
}

type Rectangle struct {
    Width, Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

func (r Rectangle) Perimeter() float64 {
    return 2 * (r.Width + r.Height)
}

func main() {
    fmt.Println("🚀 Go Programming Demo")
    fmt.Println()
    
    // Calculator usage
    calc := NewCalculator("Go Calculator")
    fmt.Printf("🧮 %s\n", calc.GetName())
    
    fmt.Printf("30 + 12 = %d\n", calc.Add(30, 12))
    fmt.Printf("7 × 8 = %d\n", calc.Multiply(7, 8))
    fmt.Printf("56 ÷ 7 = %.2f\n", calc.Divide(56, 7))
    
    // Slice operations
    numbers := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
    
    // Filter even numbers
    var evenNumbers []int
    for _, num := range numbers {
        if num%2 == 0 {
            evenNumbers = append(evenNumbers, num)
        }
    }
    
    // Calculate sum
    sum := 0
    for _, num := range numbers {
        sum += num
    }
    
    fmt.Println("\n📊 Slice Operations:")
    fmt.Printf("Original: %v\n", numbers)
    fmt.Printf("Even numbers: %v\n", evenNumbers)
    fmt.Printf("Sum: %d\n", sum)
    
    // Student management
    students := []*Student{
        NewStudent("Alice", 24),
        NewStudent("Bob", 25),
        NewStudent("Carol", 23),
    }
    
    // Add grades
    students[0].AddGrade(97.0)
    students[0].AddGrade(89.5)
    students[0].AddGrade(94.0)
    
    students[1].AddGrade(88.5)
    students[1].AddGrade(92.0)
    students[1].AddGrade(86.5)
    
    students[2].AddGrade(95.5)
    students[2].AddGrade(91.0)
    students[2].AddGrade(98.0)
    
    fmt.Println("\n👨‍🎓 Student Records:")
    for _, student := range students {
        fmt.Println(student)
    }
    
    // Interface demonstration
    shapes := []Shape{
        Circle{Radius: 5.0},
        Rectangle{Width: 4.0, Height: 6.0},
        Circle{Radius: 3.0},
        Rectangle{Width: 8.0, Height: 3.0},
    }
    
    fmt.Println("\n📐 Shape Calculations:")
    for i, shape := range shapes {
        fmt.Printf("Shape %d: Area = %.2f, Perimeter = %.2f\n", 
            i+1, shape.Area(), shape.Perimeter())
    }
    
    // Map operations
    languages := map[string]string{
        "Go":         "Systems Programming",
        "Python":     "Data Science",
        "JavaScript": "Web Development",
        "Rust":       "Systems Programming",
        "Java":       "Enterprise Applications",
    }
    
    fmt.Println("\n💻 Programming Languages:")
    for lang, purpose := range languages {
        fmt.Printf("%s - %s\n", lang, purpose)
    }
    
    // String operations
    message := "Hello, Go Programming!"
    words := strings.Fields(message)
    
    fmt.Println("\n📝 String Operations:")
    fmt.Printf("Message: %s\n", message)
    fmt.Printf("Length: %d\n", len(message))
    fmt.Printf("Words: %v\n", words)
    fmt.Printf("Uppercase: %s\n", strings.ToUpper(message))
    
    // Sorting
    scores := []int{95, 87, 92, 78, 96, 89, 84}
    fmt.Printf("\nOriginal scores: %v\n", scores)
    
    sort.Ints(scores)
    fmt.Printf("Sorted scores: %v\n", scores)
    
    // Calculator history
    fmt.Println("\n📝 Calculator History:")
    history := calc.GetHistory()
    for i, operation := range history {
        fmt.Printf("%d. %s\n", i+1, operation)
    }
}`,

  typescript: `//

  console.log(""Hello  This is  typescript)

  //`,


  rust: `// Rust Sample - Memory Safety & Performance
struct Calculator {
    name: String,
    operations: Vec<String>,
}

impl Calculator {
    fn new(name: &str) -> Self {
        Calculator {
            name: name.to_string(),
            operations: Vec::new(),
        }
    }
    
    fn add(&mut self, a: i32, b: i32) -> i32 {
        let result = a + b;
        self.operations.push(format!("{} + {} = {}", a, b, result));
        result
    }
    
    fn multiply(&mut self, a: i32, b: i32) -> i32 {
        let result = a * b;
        self.operations.push(format!("{} × {} = {}", a, b, result));
        result
    }
    
    fn get_history(&self) -> &Vec<String> {
        &self.operations
    }
}

fn main() {
    println!("🦀 Rust Calculator Demo");
    
    let mut calc = Calculator::new("Rust Calculator");
    
    // Perform calculations
    println!("\\n🧮 Calculations:");
    println!("5 + 3 = {}", calc.add(5, 3));
    println!("4 × 7 = {}", calc.multiply(4, 7));
    println!("10 + 15 = {}", calc.add(10, 15));
    
    // Vector operations
    let numbers = vec![1, 2, 3, 4, 5];
    let doubled: Vec<i32> = numbers.iter().map(|x| x * 2).collect();
    let sum: i32 = numbers.iter().sum();
    
    println!("\\n📊 Vector Operations:");
    println!("Original: {:?}", numbers);
    println!("Doubled: {:?}", doubled);
    println!("Sum: {}", sum);
    
    // String operations
    let languages = vec!["Rust", "Python", "JavaScript", "Go"];
    println!("\\n💻 Programming Languages:");
    for (index, lang) in languages.iter().enumerate() {
        println!("{}. {}", index + 1, lang);
    }
    
    // Pattern matching
    let status = "success";
    let message = match status {
        "loading" => "⏳ Loading...",
        "success" => "✅ Operation successful!",
        "error" => "❌ An error occurred",
        _ => "❓ Unknown status",
    };
    println!("\\n🔄 Status: {}", message);
    
    // History
    println!("\\n📝 Operation History:");
    for (i, operation) in calc.get_history().iter().enumerate() {
        println!("{}. {}", i + 1, operation);
    }
}`,

  java: `// Java Sample - Object-Oriented Programming
import java.util.*;

class Calculator {
    private String name;
    private List<String> operations;
    
    public Calculator(String name) {
        this.name = name;
        this.operations = new ArrayList<>();
    }
    
    public int add(int a, int b) {
        int result = a + b;
        operations.add(a + " + " + b + " = " + result);
        return result;
    }
    
    public int multiply(int a, int b) {
        int result = a * b;
        operations.add(a + " × " + b + " = " + result);
        return result;
    }
    
    public double divide(double a, double b) {
        if (b == 0) throw new ArithmeticException("Division by zero");
        double result = a / b;
        operations.add(String.format("%.1f ÷ %.1f = %.2f", a, b, result));
        return result;
    }
    
    public List<String> getHistory() {
        return new ArrayList<>(operations);
    }
    
    public String getName() {
        return name;
    }
}

class Student {
    private String name;
    private int age;
    private List<Integer> grades;
    
    public Student(String name, int age) {
        this.name = name;
        this.age = age;
        this.grades = new ArrayList<>();
    }
    
    public void addGrade(int grade) {
        grades.add(grade);
    }
    
    public double getAverage() {
        if (grades.isEmpty()) return 0.0;
        return grades.stream().mapToInt(Integer::intValue).average().orElse(0.0);
    }
    
    public String getName() { return name; }
    public int getAge() { return age; }
    public List<Integer> getGrades() { return new ArrayList<>(grades); }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("☕ Java Programming Demo");
        
        // Calculator usage
        Calculator calc = new Calculator("Java Calculator");
        System.out.println("\\n🧮 " + calc.getName());
        
        System.out.println("15 + 25 = " + calc.add(15, 25));
        System.out.println("8 × 6 = " + calc.multiply(8, 6));
        System.out.println("20 ÷ 4 = " + calc.divide(20, 4));
        
        // Student management
        List<Student> students = Arrays.asList(
            new Student("Alice", 20),
            new Student("Bob", 21),
            new Student("Carol", 19)
        );
        
        // Add grades
        students.get(0).addGrade(95);
        students.get(0).addGrade(87);
        students.get(0).addGrade(92);
        
        students.get(1).addGrade(88);
        students.get(1).addGrade(91);
        students.get(1).addGrade(85);
        
        students.get(2).addGrade(93);
        students.get(2).addGrade(89);
        students.get(2).addGrade(96);
        
        System.out.println("\\n👨‍🎓 Student Records:");
        for (Student student : students) {
            System.out.printf("%s (%d years) - Average: %.1f\\n", 
                student.getName(), student.getAge(), student.getAverage());
        }
        
        // Array operations
        int[] numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        int sum = Arrays.stream(numbers).sum();
        double average = Arrays.stream(numbers).average().orElse(0.0);
        
        System.out.println("\\n📊 Array Statistics:");
        System.out.println("Numbers: " + Arrays.toString(numbers));
        System.out.println("Sum: " + sum);
        System.out.printf("Average: %.1f\\n", average);
        
        // Operation history
        System.out.println("\\n📝 Calculator History:");
        List<String> history = calc.getHistory();
        for (int i = 0; i < history.size(); i++) {
            System.out.println((i + 1) + ". " + history.get(i));
        }
    }
}`,

  php: `<?php
// PHP Sample - Web Development Features

class Calculator {
    private $name;
    private $operations = [];
    
    public function __construct($name) {
        $this->name = $name;
    }
    
    public function add($a, $b) {
        $result = $a + $b;
        $this->operations[] = "$a + $b = $result";
        return $result;
    }
    
    public function multiply($a, $b) {
        $result = $a * $b;
        $this->operations[] = "$a × $b = $result";
        return $result;
    }
    
    public function divide($a, $b) {
        if ($b == 0) {
            throw new Exception("Division by zero");
        }
        $result = $a / $b;
        $this->operations[] = "$a ÷ $b = " . number_format($result, 2);
        return $result;
    }
    
    public function getHistory() {
        return $this->operations;
    }
    
    public function getName() {
        return $this->name;
    }
}

class Student {
    private $name;
    private $age;
    private $grades = [];
    
    public function __construct($name, $age) {
        $this->name = $name;
        $this->age = $age;
    }
    
    public function addGrade($grade) {
        $this->grades[] = $grade;
    }
    
    public function getAverage() {
        if (empty($this->grades)) return 0;
        return array_sum($this->grades) / count($this->grades);
    }
    
    public function getName() { return $this->name; }
    public function getAge() { return $this->age; }
    public function getGrades() { return $this->grades; }
}

echo "🐘 PHP Programming Demo\\n\\n";

// Calculator usage
$calc = new Calculator("PHP Calculator");
echo "🧮 " . $calc->getName() . "\\n";

echo "12 + 8 = " . $calc->add(12, 8) . "\\n";
echo "7 × 9 = " . $calc->multiply(7, 9) . "\\n";
echo "24 ÷ 6 = " . $calc->divide(24, 6) . "\\n";

// Array operations
$numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
$evenNumbers = array_filter($numbers, function($n) { return $n % 2 == 0; });
$doubled = array_map(function($n) { return $n * 2; }, $numbers);
$sum = array_sum($numbers);

echo "\\n📊 Array Operations:\\n";
echo "Original: " . implode(", ", $numbers) . "\\n";
echo "Even numbers: " . implode(", ", $evenNumbers) . "\\n";
echo "Doubled: " . implode(", ", $doubled) . "\\n";
echo "Sum: $sum\\n";

// Student management
$students = [
    new Student("Alice", 22),
    new Student("Bob", 23),
    new Student("Carol", 21)
];

// Add grades
$students[0]->addGrade(94);
$students[0]->addGrade(88);
$students[0]->addGrade(91);

$students[1]->addGrade(87);
$students[1]->addGrade(92);
$students[1]->addGrade(89);

$students[2]->addGrade(95);
$students[2]->addGrade(90);
$students[2]->addGrade(93);

echo "\\n👨‍🎓 Student Records:\\n";
foreach ($students as $student) {
    printf("%s (%d years) - Average: %.1f\\n", 
        $student->getName(), 
        $student->getAge(), 
        $student->getAverage()
    );
}

// Associative array
$languages = [
    "PHP" => "Web Development",
    "Python" => "Data Science",
    "JavaScript" => "Frontend",
    "Java" => "Enterprise"
];

echo "\\n💻 Programming Languages:\\n";
foreach ($languages as $lang => $purpose) {
    echo "$lang - $purpose\\n";
}

// Operation history
echo "\\n📝 Calculator History:\\n";
$history = $calc->getHistory();
for ($i = 0; $i < count($history); $i++) {
    echo ($i + 1) . ". " . $history[$i] . "\\n";
}

?>`,

  ruby: `# Ruby Sample - Elegant and Expressive Code

class Calculator
  attr_reader :name, :operations
  
  def initialize(name)
    @name = name
    @operations = []
  end
  
  def add(a, b)
    result = a + b
    @operations << "#{a} + #{b} = #{result}"
    result
  end
  
  def multiply(a, b)
    result = a * b
    @operations << "#{a} × #{b} = #{result}"
    result
  end
  
  def divide(a, b)
    raise "Division by zero" if b == 0
    result = a.to_f / b
    @operations << "#{a} ÷ #{b} = #{'%.2f' % result}"
    result
  end
end

class Student
  attr_reader :name, :age, :grades
  
  def initialize(name, age)
    @name = name
    @age = age
    @grades = []
  end
  
  def add_grade(grade)
    @grades << grade
  end
  
  def average
    return 0 if @grades.empty?
    @grades.sum.to_f / @grades.length
  end
  
  def to_s
    "#{@name} (#{@age} years) - Average: #{'%.1f' % average}"
  end
end

puts "💎 Ruby Programming Demo"
puts

# Calculator usage
calc = Calculator.new("Ruby Calculator")
puts "🧮 #{calc.name}"

puts "18 + 7 = #{calc.add(18, 7)}"
puts "6 × 8 = #{calc.multiply(6, 8)}"
puts "35 ÷ 7 = #{calc.divide(35, 7)}"

# Array operations with Ruby's elegant syntax
numbers = (1..10).to_a
even_numbers = numbers.select(&:even?)
doubled = numbers.map { |n| n * 2 }
sum = numbers.sum

puts
puts "📊 Array Operations:"
puts "Original: #{numbers.join(', ')}"
puts "Even numbers: #{even_numbers.join(', ')}"
puts "Doubled: #{doubled.join(', ')}"
puts "Sum: #{sum}"

# Student management
students = [
  Student.new("Alice", 24),
  Student.new("Bob", 25),
  Student.new("Carol", 23)
]

# Add grades using Ruby's elegant syntax
students[0].tap do |student|
  [96, 89, 93].each { |grade| student.add_grade(grade) }
end

students[1].tap do |student|
  [88, 91, 87].each { |grade| student.add_grade(grade) }
end

students[2].tap do |student|
  [94, 92, 97].each { |grade| student.add_grade(grade) }
end

puts
puts "👨‍🎓 Student Records:"
students.each { |student| puts student }

# Hash operations (Ruby's associative arrays)
programming_languages = {
  "Ruby" => "Web Development",
  "Python" => "Data Science", 
  "JavaScript" => "Frontend",
  "Go" => "Systems Programming"
}

puts
puts "💻 Programming Languages:"
programming_languages.each do |lang, purpose|
  puts "#{lang} - #{purpose}"
end

# Blocks and iterators
puts
puts "🔢 Number Processing:"
(1..5).each do |i|
  square = i ** 2
  cube = i ** 3
  puts "#{i}: square = #{square}, cube = #{cube}"
end

# String interpolation and methods
greeting = "Hello"
name = "World"
message = "#{greeting}, #{name}!".upcase
puts
puts "📝 String Operations:"
puts message
puts "Reversed: #{message.reverse}"
puts "Length: #{message.length}"

# Operation history
puts
puts "📝 Calculator History:"
calc.operations.each_with_index do |operation, index|
  puts "#{index + 1}. #{operation}"
end

# Ruby's range and case statement
puts
puts "🎯 Grade Classification:"
[95, 87, 76, 92, 68].each do |grade|
  classification = case grade
                  when 90..100 then "A"
                  when 80..89 then "B" 
                  when 70..79 then "C"
                  when 60..69 then "D"
                  else "F"
                  end
  puts "Grade #{grade}: #{classification}"
end`,
}
