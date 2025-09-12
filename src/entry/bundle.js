"use strict";

// Bundle entrypoint: ensure runtime is initialized and templates are registered.
// The runtime exposes window.ANKI_TEMPLATES with { register, get, util }.

require('../runtime');

// Register templates here
require('../templates/_starter/add_two_numbers');
require('../templates/arithmetic/multiply_2d_by_1d');
require('../templates/number_theory/gcf_basic');
require('../templates/number_theory/lcm_basic');

// Optionally expose a tiny helper for debugging (not required by Anki)
if (typeof window !== 'undefined') {
  window.DYNAMIC_MATH_VERSION = 'phase-3-internal';
}
