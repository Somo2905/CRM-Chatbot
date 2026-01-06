"""Security utilities for input validation and prompt injection prevention."""

import re
from typing import Tuple


class SecurityValidator:
    """Validates user input for security threats."""
    
    # Patterns that indicate potential prompt injection
    INJECTION_PATTERNS = [
        r"ignore\s+(previous|above|all|prior)\s+instructions?",
        r"disregard\s+(previous|above|all|prior)\s+instructions?",
        r"forget\s+(previous|above|all|prior)\s+instructions?",
        r"system\s*:\s*",
        r"override\s+(all\s+)?instructions?",
        r"new\s+instructions?",
        r"you\s+are\s+now",
        r"act\s+as\s+if",
        r"pretend\s+to\s+be",
        r"simulate\s+being",
        r"roleplay\s+as",
        r"reveal\s+(the\s+)?(prompt|instruction|system)",
        r"show\s+(me\s+)?(the\s+)?(prompt|instruction|system)",
        r"what\s+(is|are)\s+your\s+(system\s+)?(instructions|rules|prompts)(\s*\?|$)",
        r"your\s+(system\s+)?(instructions|rules|prompts)(\s*\?|$)",
        r"bypass\s+security",
        r"disable\s+safety",
    ]
    
    # Suspicious patterns that might indicate attacks
    SUSPICIOUS_PATTERNS = [
        r"<script",
        r"javascript:",
        r"onerror\s*=",
        r"onclick\s*=",
        r"SELECT\s+.*\s+FROM",
        r"DROP\s+TABLE",
        r"INSERT\s+INTO",
        r"DELETE\s+FROM",
        r"<\s*iframe",
        r"eval\s*\(",
        r"exec\s*\(",
    ]
    
    def __init__(self):
        self.injection_regex = [re.compile(pattern, re.IGNORECASE) for pattern in self.INJECTION_PATTERNS]
        self.suspicious_regex = [re.compile(pattern, re.IGNORECASE) for pattern in self.SUSPICIOUS_PATTERNS]
    
    def validate_input(self, user_input: str, max_length: int = 500) -> Tuple[bool, str]:
        """
        Validate user input for security threats.
        
        Args:
            user_input: The user's input text
            max_length: Maximum allowed input length
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check length
        if len(user_input) > max_length:
            return False, f"Input exceeds maximum length of {max_length} characters"
        
        # Check for empty input
        if not user_input or not user_input.strip():
            return False, "Input cannot be empty"
        
        # Check for prompt injection attempts
        for pattern in self.injection_regex:
            if pattern.search(user_input):
                return False, "Input contains suspicious content that violates security policies"
        
        # Check for suspicious patterns
        for pattern in self.suspicious_regex:
            if pattern.search(user_input):
                return False, "Input contains potentially malicious content"
        
        # Check for excessive special characters (potential encoding attacks)
        # Note: Empty input already checked above, but added safety check
        if len(user_input) > 0:
            special_char_ratio = sum(1 for c in user_input if not c.isalnum() and not c.isspace()) / len(user_input)
            if special_char_ratio > 0.3:
                return False, "Input contains excessive special characters"
        
        return True, ""
    
    def sanitize_output(self, output: str) -> str:
        """
        Sanitize model output to prevent information leakage.
        
        Args:
            output: The model's output text
            
        Returns:
            Sanitized output
        """
        # Remove any potential system prompt leakage patterns
        sanitized = output
        
        # Remove text between markers that might contain system info
        sanitized = re.sub(r'\[SYSTEM\].*?\[/SYSTEM\]', '', sanitized, flags=re.IGNORECASE | re.DOTALL)
        sanitized = re.sub(r'\[INTERNAL\].*?\[/INTERNAL\]', '', sanitized, flags=re.IGNORECASE | re.DOTALL)
        
        return sanitized.strip()


# Global instance
security_validator = SecurityValidator()
