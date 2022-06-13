---
layout: page
author: Pau Mars Verdaguer
title: Operating System Fundamentals
tags: notes
---

Every pentester must be profficient when dealing with different operating systems. In our case, most of the time is spent in a Linux shell and the target machines are usually Windows or Linux as well. In order to get OS basic notions, <a href="https://academy.hackthebox.com" target="_blank">HTB Academy</a> Operating System Fundamentals path is a good starting point.

<ul class="posts">
{% for post in site.tags.OS_fundamentals limit: 20 %}
  <div class="post_info">
    <li>
         <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  </div>
{% endfor %}
</ul>
