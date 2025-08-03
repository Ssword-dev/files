function sideEffects() {
  // some dope jquery extensions. mainly just for things i need
  // to do with.
  const jxstatic = {
    raw(jx) {
      return $(jx).get(0);
    },
  };

  const jxinst = {
    raw() {
      return $(this).get(0);
    },
  };

  $.extend(jxstatic);
  $.fn.extend(jxinst);
}

export { sideEffects };
