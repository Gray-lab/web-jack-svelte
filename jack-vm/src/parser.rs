use crate::memory::WordSize;
use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;
use wasm_bindgen_test::console_log;

#[derive(Debug, Clone)]
pub struct VMCommand {
    pub command: Command,
    pub line: usize,
}

impl VMCommand {
    fn new(command: Command, line: usize) -> VMCommand {
        VMCommand { command, line }
    }
}

pub type Offset = WordSize;
type NumVars = WordSize;
type NumArgs = WordSize;
type LabelName = String;
type Identifier = String;

#[derive(Eq, PartialEq, Debug, Clone)]
pub enum Command {
    Pop(Segment, Offset),
    Push(Segment, Offset),
    Add,
    Sub,
    Neg,
    Eq,
    Gt,
    Lt,
    And,
    Or,
    Not,
    GoTo(LabelName),
    IfGoTo(LabelName),
    Label(LabelName),
    Function(Identifier, NumVars),
    Call(Identifier, NumArgs),
    Return,
}

#[derive(Eq, PartialEq, Debug, Copy, Clone)]
pub enum Segment {
    // Stack Pointer
    Pointer,
    Constant,
    Local,
    Argument,
    Static,
    This,
    That,
    Temp,
}

fn parse_segment(seg_name: &str) -> Segment {
    match seg_name {
        "pointer" => Segment::Pointer,
        "constant" => Segment::Constant,
        "local" => Segment::Local,
        "argument" => Segment::Argument,
        "static" => Segment::Static,
        "this" => Segment::This,
        "that" => Segment::That,
        "temp" => Segment::Temp,
        otherwise => {
            panic!("{} is not a valid segment name", otherwise);
        }
    }
}

#[derive(Debug, Clone)]
pub struct Bytecode {
    pub functions: HashMap<String, Rc<RefCell<Function>>>,
}

#[derive(Debug, Clone)]
pub struct Function {
    pub start_line: usize,
    pub num_vars: WordSize,
    pub commands: Vec<VMCommand>,
    pub label_table: HashMap<String, usize>,
}

impl Function {
    pub fn add_command(&mut self, command: VMCommand) {
        self.commands.push(command);
    }
}

pub(crate) fn parse_bytecode(text: &str) -> Bytecode {
    // Initialize program and functions to be empty
    let mut program = Bytecode {
        functions: HashMap::new(),
    };

    // Initialized to bring into scope
    let mut current_function: Option<Rc<RefCell<Function>>> = None;

    for (line_num, line) in text
        .lines()
        .map(|line| {
            // remove comments: delete any text between '//' and end of line'
            if let Some(i) = line.find("//") {
                &line[..i]
            } else {
                line
            }
        })
        .enumerate()
    {
        if line.trim().is_empty() {
            continue;
        }

        let line_words: Vec<&str> = line.trim().split(' ').collect();
        // Check the number of arguments in each line
        let parsed_line = match line_words.len() {
            1 => match line_words[0] {
                "add" => Some(VMCommand::new(Command::Add, line_num)),
                "sub" => Some(VMCommand::new(Command::Sub, line_num)),
                "neg" => Some(VMCommand::new(Command::Neg, line_num)),
                "eq" => Some(VMCommand::new(Command::Eq, line_num)),
                "gt" => Some(VMCommand::new(Command::Gt, line_num)),
                "lt" => Some(VMCommand::new(Command::Lt, line_num)),
                "and" => Some(VMCommand::new(Command::And, line_num)),
                "or" => Some(VMCommand::new(Command::Or, line_num)),
                "not" => Some(VMCommand::new(Command::Not, line_num)),
                "return" => Some(VMCommand::new(Command::Return, line_num)),
                otherwise => {
                    panic!(
                        "Invalid zero argument command at line {}: {}",
                        line_num, otherwise
                    );
                }
            },
            2 => match (line_words[0], line_words[1]) {
                ("class", _) => None,
                ("goto", label) => Some(VMCommand::new(Command::GoTo(label.to_string()), line_num)),
                ("if-goto", label) => {
                    Some(VMCommand::new(Command::IfGoTo(label.to_string()), line_num))
                }
                ("label", label) => {
                    let function = &current_function.clone().unwrap();
                    let label_location: usize = line_num - function.borrow().start_line;
                    if let Some(prev_label_location) = function
                        .borrow_mut()
                        .label_table
                        .insert(label.to_string(), label_location)
                    {
                        panic!(
                            "Duplicate label {} encountered on lines {} and {}",
                            label, label_location, prev_label_location
                        );
                    }
                    Some(VMCommand::new(Command::Label(label.to_string()), line_num))
                }
                (otherwise, _) => {
                    panic!(
                        "Invalid one argument command at line {}: {}",
                        line_num, otherwise
                    );
                }
            },
            3 => {
                match (
                    line_words[0],
                    line_words[1],
                    line_words[2]
                        .parse::<WordSize>()
                        .expect("Second argument should be parsable to an i32"),
                ) {
                    ("pop", segment, index) => Some(VMCommand::new(
                        Command::Pop(parse_segment(segment), index),
                        line_num,
                    )),
                    ("push", segment, index) => Some(VMCommand::new(
                        Command::Push(parse_segment(segment), index),
                        line_num,
                    )),
                    ("function", fn_name, var_count) => {
                        // Initialize a new function
                        let f = Rc::new(RefCell::new(Function {
                            start_line: line_num,
                            num_vars: var_count,
                            commands: Vec::new(),
                            label_table: HashMap::new(),
                        }));

                        program.functions.insert(fn_name.to_string(), f);

                        current_function = program.functions.get(fn_name).cloned();
                        Some(VMCommand::new(
                            Command::Function(fn_name.to_string(), var_count),
                            line_num,
                        ))
                    }
                    ("call", fn_name, num_args) => Some(VMCommand::new(
                        Command::Call(fn_name.to_string(), num_args),
                        line_num,
                    )),
                    (otherwise, _, _) => {
                        panic!(
                            "Invalid two argument command at line {}: {}",
                            line_num, otherwise
                        );
                    }
                }
            }
            otherwise => {
                panic!(
                    "Invalid syntax at line {}. Expecting 0, 1, or two arguments, but was given {}",
                    line_num, otherwise
                );
            }
        };

        if let Some(f) = &current_function {
            if let Some(c) = parsed_line {
                f.borrow_mut().add_command(c)
            };
        }
    }
    program
}
