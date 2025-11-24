# Contributing to Synapse Model

Thank you for your interest in contributing to Synapse Model! We welcome contributions from the community to help make decentralized AI infrastructure better for everyone.

## 🌟 How to Contribute

There are many ways to contribute to this project:

- 🐛 **Report bugs** and issues
- 💡 **Suggest new features** or improvements
- 📝 **Improve documentation**
- 🔧 **Submit pull requests** with bug fixes or features
- 🧪 **Test** the application and provide feedback
- ⭐ **Star the repository** to show your support

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and **pnpm** (or npm)
- **Python** 3.11+
- **Sui CLI** (for contract development)
- **Git** for version control
- **Sui Wallet** browser extension
- **AWS Account** (for backend development)

### Fork and Clone

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/Synapse-Model.git
cd Synapse-Model
```

3. **Add upstream** remote:

```bash
git remote add upstream https://github.com/AbhimanyuAjudiya/Synapse-Model.git
```

### Setup Development Environment

#### Frontend Setup

```bash
cd frontend
pnpm install

# Create .env file
echo "VITE_BACKEND_API_URL=http://localhost:8000" > .env

# Start development server
pnpm dev
```

#### Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here
AWS_LAUNCH_TEMPLATE_ID=lt-xxxxx
EOF

# Start development server
python main.py
```

#### Smart Contract Setup

```bash
cd contracts

# Build contracts
sui move build

# Run tests
sui move test

# Publish to testnet
sui client publish --gas-budget 100000000
```

---

## 📋 Development Workflow

### 1. Create a Branch

Create a new branch for your feature or bugfix:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bugfix-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments where necessary
- Update documentation if needed

### 3. Test Your Changes

#### Frontend Testing

```bash
cd frontend
pnpm lint        # Check for linting errors
pnpm type-check  # TypeScript type checking
pnpm build       # Ensure build works
```

#### Backend Testing

```bash
cd backend
black .          # Format code
pytest           # Run tests (if available)
python main.py   # Start server and test manually
```

#### Contract Testing

```bash
cd contracts
sui move test    # Run Move tests
sui move build   # Ensure compilation succeeds
```

### 4. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add model versioning support"
# or
git commit -m "fix: resolve EC2 instance cleanup issue"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name
```

Then:
1. Go to GitHub and create a **Pull Request**
2. Fill out the PR template with details
3. Link any related issues
4. Wait for review and address feedback

---

## 🎯 Contribution Guidelines

### Code Style

#### TypeScript/React (Frontend)

- Use **TypeScript** for type safety
- Follow **functional components** with hooks
- Use **Tailwind CSS** for styling
- Keep components **small and focused**
- Use **meaningful variable names**

Example:
```typescript
// Good
const handleCreateInstance = async () => {
  setIsCreating(true)
  try {
    const response = await createInstance(modelId)
    setInstanceData(response)
  } catch (error) {
    setError(error.message)
  } finally {
    setIsCreating(false)
  }
}

// Avoid
const h = async () => {
  // unclear function name
  setX(true)
  // unclear state variable
}
```

#### Python (Backend)

- Follow **PEP 8** style guide
- Use **type hints** where possible
- Write **docstrings** for functions
- Use **async/await** for I/O operations
- Handle **errors gracefully**

Example:
```python
# Good
async def create_instance(blob_id: str) -> Dict[str, Any]:
    """
    Create EC2 instance and fetch model from Walrus.
    
    Args:
        blob_id: Walrus blob identifier
        
    Returns:
        Instance details with public IP
    """
    try:
        instance = await ec2_client.create_instance(blob_id)
        return instance
    except Exception as e:
        logger.error(f"Failed to create instance: {e}")
        raise

# Avoid
def create(b):  # No type hints, unclear name
    return x
```

#### Move (Smart Contracts)

- Follow **Move best practices**
- Add **comments** for complex logic
- Use **events** for important state changes
- Test **all edge cases**
- Check for **abort conditions**

Example:
```move
// Good
public entry fun upload_model(
    registry: &mut ModelRegistry,
    blob_id: String,
    object_id: String,
    name: String,
    description: String,
    clock: &Clock,
    ctx: &TxContext
) {
    // Validate inputs
    assert!(string::length(&blob_id) > 0, EInvalidBlobId);
    assert!(!table::contains(&registry.models, blob_id), EModelExists);
    
    // Create model struct
    let model = Model {
        uploader: tx_context::sender(ctx),
        uploaded_at: clock::timestamp_ms(clock),
        name,
        description,
        blob_id,
        object_id,
    };
    
    // Store and emit event
    table::add(&mut registry.models, blob_id, model);
    event::emit(ModelUploaded { blob_id, ... });
}
```

### Documentation

- Update **README.md** if you add features
- Add **JSDoc/docstrings** to your functions
- Update **API documentation** for endpoint changes
- Include **code comments** for complex logic

### Testing

- Test your changes **thoroughly**
- Add **unit tests** for new functions
- Test **edge cases** and error handling
- Verify **UI changes** in multiple browsers

---

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description** - Clear description of the bug
2. **Steps to Reproduce** - How to reproduce the issue
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Screenshots** - If applicable
6. **Environment** - Browser, OS, Node version, etc.
7. **Error Messages** - Console logs or error traces

Use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md) if available.

---

## 💡 Suggesting Features

When suggesting features, please include:

1. **Problem** - What problem does this solve?
2. **Solution** - Your proposed solution
3. **Alternatives** - Other solutions you considered
4. **Use Case** - Real-world usage scenario
5. **Mockups** - UI mockups if applicable

Use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md) if available.

---

## 📦 Pull Request Process

1. **Update documentation** with details of changes
2. **Update README.md** if adding features
3. **Add tests** for new functionality
4. **Ensure CI passes** (linting, type checking, build)
5. **Request review** from maintainers
6. **Address feedback** promptly
7. **Squash commits** if requested
8. **Wait for approval** before merging

### PR Checklist

Before submitting, ensure:

- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] Tests pass locally
- [ ] Dependent changes merged

---

## 🏗️ Project Structure Reference

Understanding the codebase:

```
Synapse-Model/
├── frontend/                 # React TypeScript app
│   ├── components/          # React components
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilities
│   ├── pages/               # Page components
│   └── types/               # TypeScript types
│
├── backend/                  # Python FastAPI
│   ├── main.py              # Main API file
│   └── requirements.txt     # Dependencies
│
├── contracts/                # Sui Move contracts
│   └── sources/
│       └── model_registry.move
│
└── docs/                     # Documentation
```

---

## 🌐 Community

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Pull Requests** - Code contributions
- **Discord** - Real-time chat (if available)

---

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards others

**Unacceptable behavior includes:**
- Harassment, trolling, or derogatory comments
- Personal or political attacks
- Publishing others' private information
- Any conduct inappropriate in a professional setting

### Enforcement

Project maintainers have the right to remove, edit, or reject comments, commits, code, issues, and other contributions that do not align with this Code of Conduct.

---

## 📝 License

By contributing to Synapse Model, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort in improving Synapse Model!

---

## 📞 Questions?

If you have questions about contributing, feel free to:

- Open a [GitHub Discussion](https://github.com/AbhimanyuAjudiya/Synapse-Model/discussions)
- Create an [Issue](https://github.com/AbhimanyuAjudiya/Synapse-Model/issues)
- Reach out to maintainers

---

**Happy Contributing! 🚀**
