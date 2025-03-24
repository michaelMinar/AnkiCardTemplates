import random

def generate_math_expression(num_terms=3, include_parens=True, include_exponents=True):
    """
    Generates a random mathematical expression to test order of operations (PEMDAS/BODMAS).

    Args:
        num_terms: The number of terms in the expression (default: 3).
        include_parens: Whether to include parentheses (default: True).
        include_exponents: Whether to include exponents (default: True).

    Returns:
        A string representing the generated mathematical expression.
    """

    operators = ['+', '-', '*', '/']
    if include_exponents:
        operators.append('**')

    expression = []
    for i in range(num_terms):
        if i == 0:
            # First term is always a number
            expression.append(str(random.randint(1, 10)))
        else:
            # Randomly choose an operator or a number
            if random.random() < 0.5:
                expression.append(random.choice(operators))
                expression.append(str(random.randint(1, 10)))
            else:
                # Add a number
                expression.append(str(random.randint(1, 10)))

    # Optionally add parentheses
    if include_parens and random.random() < 0.7:
        # Find a suitable place to add parentheses
        paren_start = random.randint(0, len(expression) // 2)
        paren_end = random.randint(paren_start + 2, len(expression) - 1)
        expression.insert(paren_start, "(")
        expression.insert(paren_end + 1, ")")

    return " ".join(expression)
